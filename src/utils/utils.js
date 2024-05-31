const passwordComplexity = require("joi-password-complexity");
const Joi = require("joi");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const { User } = require("../models/user");
// const Like = require("../models/like");
// const CommentLike = require('../models/commentLike');

const collections = { user: "user", group: "group" };
// const lisOfCollections = { user: "user", group: "group" };
// const collections = {};
// collections[lisOfCollections?.group] = "group";

const typeofObjectIdInString = "ObjectId";
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const firebaseUrlRegex = /^https:\/\/firebase.storage\.googleapis\.com\/.*/;

const getRelatedUsersData = async (foundedData) => {
  if (foundedData.length === 0) {
    throw new Error("founded Data array is empty");
  }
  const userIds = foundedData.map((like) => like?.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  // const commentLikes = await CommentLike.find({ _id: { $in: userIds } }).lean();
  console.log("foundedData: ", typeof foundedData, foundedData);
  // return
  const likesWithUsers = foundedData.map((like) => {
    const user = users.find((u) => u._id.toString() === like.userId.toString());
    const userData = (({ profileImage, email, username, displayName }) => ({
      profileImage: profileImage ?? null,
      email: email ?? null,
      username: username ?? null,
      displayName: displayName ?? null,
    }))(user);
    const data = { ...like, user: userData || null };
    return data;
  });

  return likesWithUsers;
};

function removePasswordFromUsersArray(usersArray) {
  return newUsers;
}

function removeObjectKeys(object, ...keysToRemove) {
  console.log("object: ", object);
  const newObject = { ...object };
  console.log("newObject: ", newObject);
  keysToRemove.forEach((key) => {
    if (newObject.hasOwnProperty(key)) {
      delete newObject[key];
    }
  });
  console.log("newObject final: ", newObject);
  return newObject;
}

const convertToMongooseId = (id) => {
  if (!id) {
    console.error("Provided ID can't be empty");
    return;
  }
  return new mongoose.Types.ObjectId(id);
};

const createRefSchema = (refName, requiredFlag = true) => {
  if (!refName) return console.log("reference name cannot be empty");

  return {
    type: Schema.Types.ObjectId,
    ref: refName,
    required: requiredFlag,
    immutable: true,
    validate: {
      validator: async function (value) {
        const model = mongoose.model(refName);
        const document = await model.findById(value);
        return document !== null;
      },
      message: `${refName} does not exist`,
    },
  };
};

const objectIdJoiValidation = (fieldName) => {
  return Joi.string()
    .alphanum()
    .pattern(objectIdRegex)
    .required()
    .messages({
      "string.empty": `${fieldName} ID cannot be empty`,
      "any.required": `${fieldName} ID is required.`,
      "string.pattern.base": `${fieldName} ID must be a valid ObjectId`,
    });
};

const arrayOfObjectIdsValidation = (fieldName, min, max = 999999999999999) => {
  return Joi.array()
    .items(Joi.string().pattern(objectIdRegex).required())
    .min(min)
    .max(max)
    .required()
    .messages({
      "array.base": `${fieldName} must be provided as an array`,
      "array.min": `At least ${min} ${fieldName} must be provided`,
      "string.max": `${fieldName} name must be at most ${max} characters`,
      "any.required": `${fieldName} is required`,
      "string.pattern.base": `Each ${fieldName} must be a valid ObjectId`,
    });
};

const nameJoiValidation = (fieldName = "", minLength, maxLength) => {
  return Joi.string()
    .min(minLength)
    .max(maxLength)
    .required()
    .messages({
      "string.base": `${fieldName} name must be a string`,
      "string.empty": `${fieldName} name cannot be empty`,
      "any.required": `${fieldName} name is required.`,
      "string.min": `${fieldName} name must be at least ${minLength} characters`,
      "string.max": `${fieldName} name must be at most ${maxLength} characters`,
    });
};

const participantsSchema = {
  type: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  required: true,
  immutable: true,
  validate: {
    validator: function (arr) {
      return new Set(arr).size === arr.length;
    },
    message: "Participants must be different",
  },
};

const messageAttachmentsJoiSchema = Joi.array()
  .items(
    Joi.object({
      type: Joi.string().valid("image", "video", "file").required().messages({
        "any.only":
          "Attachment type must be one of 'image', 'video', or 'file'.",
        "any.required": "Attachment type is required.",
        "string.empty": "Attachment type cannot be empty",
      }),
      url: Joi.string()
        .uri({ scheme: ["http", "https"] })
        .required()
        .messages({
          "any.required": "Attachment URL is required.",
          "string.empty": "Attachment URL cannot be empty",
          "string.uri": "Attachment URL must be a valid URL.",
        }),
    })
  )
  .default([]);

const messageContentJoiSchema = Joi.string().required().messages({
  "any.required": "Content is required.",
  "string.empty": "Content cannot be empty",
});

const checkArrayType = (params) =>
  Array.isArray(params) ? "Array" : "not an Array";

const processPostsAndCheckUserLikes = async (posts, userId) => {
  // Check input validity
  if (!Array.isArray(posts) || !mongoose.isValidObjectId(userId)) {
    return;
  }

  // Modify posts array
  posts = posts.map((post) => {
    delete post?.author?.password;
    return post;
  });

  // Check if each post is liked by the current user
  for (let post of posts) {
    const likedByUser = await Like.findOne({ postId: post?._id, userId });
    post.isLikedByCurrentUser = likedByUser ? true : false;
  }

  return posts;
};

const complexityOptions = {
  min: 8, // Minimum password length
  max: 30, // Maximum password length
  lowerCase: 1, // Require at least 1 lowercase letter
  upperCase: 1, // Require at least 1 uppercase letter
  numeric: 1, // Require at least 1 numeric character
  symbol: 1, // Require at least 1 special character
  requirementCount: 5, // Total number of requirements that must be met
};

const passwordSchema = passwordComplexity(complexityOptions).messages({
  "passwordComplexity.tooShort":
    "Password must be at least {{#limit}} characters long",
  "passwordComplexity.uppercase":
    "Password must contain at least one uppercase letter",
  "passwordComplexity.lowercase":
    "Password must contain at least one lowercase letter",
  "passwordComplexity.numeric": "Password must contain at least one number",
  "passwordComplexity.symbol":
    "Password must contain at least one special character",
});

function isLikedByCurrentUser(reqUserId, commentsArray) {
  if (!reqUserId || !commentsArray || !Array.isArray(commentsArray)) return [];

  const convertedUserId = convertToMongooseId(reqUserId);

  for (const comment of commentsArray) {
    if (
      comment &&
      comment?.likeUserIds &&
      Array.isArray(comment?.likeUserIds)
    ) {
      comment.likedByCurrentUser = comment?.likeUserIds.some((item) =>
        convertedUserId.equals(item)
      );
      delete comment?.likeUserIds;
    } else {
      comment.likedByCurrentUser = false;
      delete comment?.likeUserIds;
    }
  }

  return commentsArray;
}

const createPayload = (obj) => {
  return { ...obj };
  // const { limit, page } = obj;
  // return { limit, page };
};

function checkIfIdsAreSameInArray(data) {
  if (!data) return;
  if (!Array.isArray(data)) return;

  const idSet = new Set();
  for (const item of data) {
    if (idSet.has(item?._id)) {
      return true;
    } else {
      idSet.add(item?._id);
    }
  }
  return false;
}

module.exports = {
  collections,
  objectIdRegex,
  typeofObjectIdInString,
  getRelatedUsersData,
  removePasswordFromUsersArray,
  removeObjectKeys,
  firebaseUrlRegex,
  convertToMongooseId,
  createRefSchema,
  objectIdJoiValidation,
  arrayOfObjectIdsValidation,
  nameJoiValidation,
  participantsSchema,
  messageContentJoiSchema,
  messageAttachmentsJoiSchema,
  checkArrayType,
  processPostsAndCheckUserLikes,
  passwordSchema,
  complexityOptions,
  isLikedByCurrentUser,
  createPayload,
  checkIfIdsAreSameInArray,
};

// Joi validations
// objectIdJoiValidation,
// arrayOfObjectIdsValidation,
// nameJoiValidation,
