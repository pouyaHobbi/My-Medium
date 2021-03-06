import { gql } from 'apollo-boost'

// Queries
export const GET_ALL_USERS = gql`
	{
		getAllUsers {
			_id
			name
			nickName
			email
			password
			passwordConfirm
			profileImage
			sexually
			followers
			followings
			posts {
				_id
				sharedUser
				image
				createdAt
				description
				likes
				comments {
					userId
					text
					createdAt
				}
			}
			joinDate
		}
	}
`

export const GET_CURRENT_USER = gql`
	query($_id: ID!) {
		getCurrentUser(_id: $_id) {
			_id
			name
			nickName
			email
			password
			passwordConfirm
			profileImage
			sexually
			followers
			followings
			posts {
				_id
				sharedUser
				image
				createdAt
				description
				likes
			}

			joinDate
		}
	}
`
export const GET_CURRENT_USER_POSTS = gql`
	query($_id: ID!) {
		getCurrentUserPosts(_id: $_id) {
			_id
			sharedUser
			createdAt
			description
			likes
			image
			comments {
				userId
				text
				createdAt
			}
		}
	}
`

export const GET_ALL_POSTS = gql`
	{
		getAllPosts {
			_id
			sharedUser
			image
			createdAt
			description
			likes
			comments {
				userId
				text
				createdAt
			}
		}
	}
`

// Mutations

export const SIGN_UP = gql`
	mutation(
		$name: String!
		$nickName: String!
		$password: String!
		$passwordConfirm: String!
		$email: String!
		$profileImage: String
		$sexually: String
	) {
		signup(
			name: $name
			nickName: $nickName
			email: $email
			password: $password
			passwordConfirm: $passwordConfirm
			profileImage: $profileImage
			sexually: $sexually
		) {
			token
		}
	}
`

export const SIGNIN = gql`
	mutation($email: String!, $password: String!) {
		signin(email: $email, password: $password) {
			token
		}
	}
`

export const UPDATE_USER = gql`
	mutation(
		$_id: ID!
		$name: String
		$nickName: String
		$password: String
		$passwordConfirm: String
		$email: String
		$sexually: String
		$profileImage: String
	) {
		updateUserProfile(
			_id: $_id
			name: $name
			nickName: $nickName
			email: $email
			password: $password
			passwordConfirm: $passwordConfirm
			sexually: $sexually
			profileImage: $profileImage
		) {
			token
		}
	}
`

export const DELETE_USER = gql`
	mutation($_id: ID!) {
		deleteUser(_id: $_id)
	}
`

export const FOLLOW = gql`
	mutation($value: String!, $targetUserId: ID!, $currentUserId: ID!) {
		follow(
			targetUserId: $targetUserId
			currentUserId: $currentUserId
			value: $value
		) {
			_id
			name
			nickName
			email
			password
			passwordConfirm
			profileImage
			sexually
			followers
			followings
			posts {
				_id
				sharedUser
				image
				createdAt
				description
				likes
			}
			joinDate
		}
	}
`

export const LIKE = gql`
	mutation($_id: ID!, $userId: ID!, $term: String!) {
		like(_id: $_id, userId: $userId, term: $term) {
			_id
			sharedUser
			image
			createdAt
			description
			likes
		}
	}
`
export const ADD_COMMENT = gql`
	mutation($userId: ID!, $postId: ID!, $text: String!, $term: String!) {
		addComment(userId: $userId, postId: $postId, term: $term, text: $text) {
			userId
			text
			createdAt
		}
	}
`

export const CREATE_POST = gql`
	mutation($sharedUser: ID!, $image: String!, $description: String!) {
		addPost(sharedUser: $sharedUser, image: $image, description: $description) {
			_id
			sharedUser
			image
			createdAt
			likes
			description
			comments {
				userId
				text
				createdAt
			}
		}
	}
`
