const express = require("express");
const {
  validateUserId,
  validateUser,
  validatePost,
} = require("../middleware/middleware");

const User = require("./users-model");
const Post = require("../posts/posts-model");
// You will need `users-model.js` and `posts-model.js` both
// The middleware functions also need to be required

const router = express.Router();

router.get("/", async (req, res, next) => {
  // RETURN AN ARRAY WITH ALL THE USERS
  try {
    const users = await User.get();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }

  // User.get()
  //   .then((users) => {
  //     res.json(users);
  //     console.log(users);
  //   })
  //   .catch(next);
});

router.get("/:id", validateUserId, (req, res) => {
  // RETURN THE USER OBJECT
  // this needs a middleware to verify user id
  res.json(req.user);
});

router.post("/", validateUser, async (req, res, next) => {
  // RETURN THE NEWLY CREATED USER OBJECT
  // this needs a middleware to check that the request body is valid
  try {
    const user = await User.insert({ name: req.name });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
  // User.insert({ name: req.body.name })
  //   .then((newUser) => {
  //     res.status(201).json(newUser);
  //   })
  //   .catch(next);
});

router.put("/:id", validateUserId, validateUser, (req, res, next) => {
  // RETURN THE FRESHLY UPDATED USER OBJECT
  // this needs a middleware to verify user id
  // and another middleware to check that the request body is valid
  User.update(req.params.id, { name: req.name })
    .then(() => {
      return User.getById(req.params.id);
    })
    .then((user) => {
      res.json(user);
    })
    .catch(next);
});

router.delete("/:id", validateUserId, async (req, res, next) => {
  try {
    await User.remove(req.params.id);
    res.json(req.user);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/posts", validateUserId, async (req, res, next) => {
  try {
    const result = await User.getUserPosts(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/posts",
  validateUserId,
  validatePost,
  async (req, res, next) => {
    try {
      const result = await Post.insert({
        user_id: req.params.id,
        text: req.text,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

router.use((err, req, res, next) => {
  // eslint-disable-line
  res.status(err.status || 500).json({
    customMessage: "something tragic inside posts router happened",
    message: err.message,
    stack: err.stack,
  });
});
// do not forget to export the router

module.exports = router;
