const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const createToken = (user, secret, expiresIn) => {
	const {
		name,
		nickName,
		password,
		passwordConfirm,
		profileImage,
		sexually,
		email,
		followings,
		followers,
		posts,
		_id,
	} = user
	return jwt.sign(
		{
			name,
			nickName,
			password,
			passwordConfirm,
			profileImage,
			sexually,
			email,
			followings,
			followers,
			posts,
			_id,
		},
		secret,
		{ expiresIn }
	)
}

// fix the getall users post field that save like id but woe neede populate it

exports.resolvers = {
	Query: {
		getAllUsers: async (parent, args, { User }, info) => {
			let users = await User.find().populate({
				path: 'posts',
				model: 'Post',
				populate: {
					path: 'comments',
					model: 'Comment',
				},
			})

			return users
		},
		getCurrentUser: async (parent, { _id }, { User }, info) => {
			let user = await User.findById({ _id }).populate({
				path: 'posts',
				model: 'Post',
				populate: {
					path: 'comments',
					model: 'Comment',
				},
			})
			return user
		},
		getAllPosts: async (parent, args, { Post }, info) => {
			let posts = await Post.find().populate({
				path: 'comments',
				model: 'Comment',
			})
			return posts
		},
		getCurrentUserPosts : async (parent , { _id } , { User , Post} , info) => {
			let user = await User.findById({ _id }).populate({
				path : "posts",
				model : "Post",
				populate : {
					path : "comments",
					model : "Comment"
				}
			})
			console.log(user)
			return user.posts
		}
	},
	Mutation: {
		signup: async (parent, args, { User }, info) => {
			const {
				name,
				nickName,
				email,
				password,
				passwordConfirm,
				profileImage,
				sexually,
			} = args
			const userExistWithEmail = await User.findOne({ email })
			const userExistWithNickName = await User.findOne({ nickName })
			if (userExistWithEmail || userExistWithNickName) {
				throw new Error(
					'User already exist. Please choose another email or nickName'
				)
			}
			if (password !== passwordConfirm) {
				throw new Error('Password and passwordConfirm are not same.')
			}
			let newUser = await new User({
				name,
				nickName,
				password,
				passwordConfirm,
				profileImage,
				sexually,
				email,
			})
			newUser._id = newUser._id
			newUser.followings = []
			newUser.followers = []
			newUser.posts = []

			newUser.save()
			return { token: createToken(newUser, process.env.SECRET, '1hr') }
		},
		signin: async (parent, { email, password }, { User }, info) => {
			let user = await User.findOne({ email })
			if (!user) {
				throw new Error('Invalid email or password.')
			}
			const isValidPassword = await bcrypt.compare(password, user.password)
			if (!isValidPassword) {
				throw new Error('Invalid email or password.')
			}
			return { token: createToken(user, process.env.SECRET, '1hr') }
		},
		addPost: async (parent, args, { Post, User }, info) => {
			const { sharedUser, image, description } = args
			let newPost = await new Post({
				sharedUser,
				image,
				description,
			})

			let findUser = await User.findById(sharedUser).populate({
				path: 'posts',
				model: 'Post',
				populate: {
					path: 'comments',
					model: 'Comment',
				},
			})
			findUser.posts.push(newPost)

			await newPost.save()
			await findUser.save()
			return newPost
		},
		deletePost: async (parent, { _id, userId }, { Post, User }, info) => {
			let user = await User.findById(userId)
			console.log(user)
			let deletePost = await Post.findOneAndRemove({ _id })
			if (!deletePost) {
				throw new Error('Post not found.')
			}
			return deletePost
		},
		updateUserProfile: async (parent, args, { User }, info) => {
			const {
				name,
				nickName,
				email,
				password,
				passwordConfirm,
				profileImage,
				sexually,
				_id,
			} = args

			let user = await User.findOne({ _id })

			if (!user) {
				throw new Error('User not found.')
			}

			let userExistWithEmail = await User.findOne({ email })
			if (userExistWithEmail) {
				throw new Error('Email address already exists.')
			}
			let userExistWithNickName = await User.findOne({ nickName })
			if (userExistWithNickName) {
				throw new Error('NickName already exists')
			}

			user.name = name || user.name
			user.nickName = nickName || user.nickName
			user.email = email || user.email
			user.password = password || user.password
			user.passwordConfirm = passwordConfirm || user.passwordConfirm
			user.profileImage = profileImage || user.profileImage
			user.sexually = sexually || user.sexually

			await user.save()
			return {
				token: createToken(user, process.env.SECRET, '1hr'),
			}
		},
		deleteUser: async (parent, { _id }, { User }, info) => {
			let user = await User.findOneAndRemove({ _id })
			if (!user) {
				throw new Error('User not found.')
			}

			return user._id
		},
		follow: async (
			parent,
			{ targetUserId, currentUserId, value },
			{ User }
		) => {
			let currentUser = await User.findById(currentUserId).populate({
				path: 'posts',
				model: 'Post',
				populate: {
					path: 'comments',
					model: 'Comment',
				},
			})
			let targetUser = await User.findById(targetUserId).populate({
				path: 'posts',
				model: 'Post',
				populate: {
					path: 'comments',
					model: 'Comment',
				},
			})

			if (!targetUser) {
				throw new Error('User not found.')
			}

			if (value === 'follow') {
				await currentUser.followings.push(targetUser._id)
				await targetUser.followers.push(currentUser._id)
				await targetUser.save()
				await currentUser.save()

				return [currentUser, targetUser]
			} else if (value === 'unFollow') {
				let removeFromCurrentUser = await currentUser.followings.indexOf(
					targetUserId
				)
				let removeFromTargetUser = await targetUser.followers.indexOf(
					currentUserId
				)
				if (removeFromCurrentUser > -1) {
					await currentUser.followings.splice(removeFromCurrentUser, 1)
					await targetUser.followers.splice(removeFromTargetUser, 1)
					await currentUser.save()
					await targetUser.save()
				}
				return [currentUser, targetUser]
			}
			return [currentUser, targetUser]
		},
		like: async (parent, { _id, userId, term }, { Post, User }, info) => {
			let post = await Post.findById({ _id })
			let user = await User.findById(userId)
			if (term === 'unLike') {
				let unlike = await post.likes.indexOf(user._id)
				if (unlike > -1) {
					await post.likes.splice(unlike, 1)
					await post.save()
					return post
				}
			}
			if (term === 'like') {
				await post.likes.push(user._id)
				await post.save()
				return post
			}
			return post
		},
		addComment: async (
			parent,
			{ userId, postId, term, text },
			{ User, Post, Comment },
			info
		) => {
			let user = await User.findById(userId)
			let post = await Post.findById(postId)
			let comment = await new Comment({
				text,
				userId,
				postId,
			})
			await post.comments.push(comment)
			await post.save()
			await comment.save()
			return comment
		},
	},
}
