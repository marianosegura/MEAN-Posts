const Post = require('../../models/post');  // mongoose model

exports.getPosts = (req, res, next) => { 
  console.log('\nFetching posts...');
  let postQuery = Post.find();  // fetch all by default
  
  
  const userIdFilter = req.query.userIdFilter;  // filter by user id
  if (userIdFilter) {
    postQuery = Post.find({ userId: userIdFilter });
  } 

  const pageSize = +req.query.pageSize;  // pagination 
  const pageIndex = +req.query.pageIndex; 
  const paginatedQuery = pageSize && pageIndex !== undefined;  // pageIndex can be zero, so check for undefined
  if (paginatedQuery) {
    postQuery
    .skip(pageSize * pageIndex)
    .limit(pageSize); 
  } 

  let fetchedPosts;  // to access in the second then block and return
  postQuery  // using model to query 'posts' collection
    .then((documents) => {
      fetchedPosts = documents;
      if (userIdFilter) {
        return Post.countDocuments({ userId: userIdFilter });  // count with condition when filtering
      }
      return Post.countDocuments();  // chained query to get total amount of posts too
    })
    .then((postsCount) => {
      console.log('Posts sent!');
      res.status(200).json({  // 200=ok
          message: 'Posts fetched successfully!',  // some extra data
          posts: fetchedPosts,
          postsCount: postsCount  // return total amount of posts
        });
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching posts!" });
    });;
};

exports.createPost = (req, res, next) => { 
  const serverUrl = req.protocol + '://' + req.get("host");  // like https + :// + localhost:3000
  const { title, content } = req.body;  // req.body is body-parser courtesy
  const post = new Post({  // instantianing mongoose model
    title, 
    content, 
    imagePath: serverUrl + "/images/" + req.file.filename,  // req.file given by multer
    userId: req.userData.userId,  // attached by checkAuth
    username: req.userData.username
  }); 

  console.log('\nCreating post: ' + post);
  post.save()  // saved by mongoose model
    .then((createdPost) => {  // createdPost has _id to return for frontend local updating
      console.log("Created post '" + req.body.title + "'!");
      res.status(201).json({  // 201=resource created ok
        message: "Post added successfully!",
        post: {
          id: createdPost._id,  // create object to remap id -> _id
          title: createdPost.title,
          content: createdPost.content,
          imagePath: createdPost.imagePath,
          userId: createdPost.userId,
          username: createdPost.username
        }
      });  
    })
    .catch((error) => {
      return res.status(500).json({ message: "Post creation failed!" });
    });
};

exports.deletePost = (req, res, next) => {
  console.log(`\nDeleting post (id ${req.params.id})...`);
  Post.deleteOne({ _id: req.params.id, userId: req.userData.userId })
    .then((result) => {
      if (result.n == 1) {
        console.log(`Deleted post (id ${req.params.id})`);
        return res.status(200).json({ message: 'Post deleted!' });
      }
      return res.status(401).json({ message: 'User not authorized to update!' });
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error deleting post!" });
    });
}

exports.updatePost = (req, res, next) => {
  console.log(`\nUpdating post '${req.body.title}'...`);
  const { id, title, content } = req.body;
  let imagePath = req.body.imagePath;  // string defined in original imagePath case
  if (req.file) {
    const serverUrl = req.protocol + '://' + req.get("host");
    imagePath = serverUrl + "/images/" + req.file.filename;
  }
  
  const post = new Post({ 
    _id: id, 
    title, 
    content, 
    imagePath, 
    userId: req.userData.userId,
    username: req.userData.username 
  });

  Post.updateOne({ _id: req.params.id, userId: req.userData.userId }, post)
    .then((result) => {  // // 2nd case is update without changes
      if (result.nModified == 1  || result.n == 1 && result.nModified == 0) { 
        console.log(`Updated post  '${req.body.title}'!`);
        res.status(200).json({ message: 'Post updated!' });
      } else {
        res.status(401).json({ message: 'User not authorized to update!' });  // found 0 matching documents
      } 
    })
    .catch((error) => {
      return res.status(500).json({ message: "Post update failed!" });
    });
};

exports.getPost = (req, res, next) => {
  const id = req.params.id;
  console.log(`\nFetching post (id ${id})...`);
  Post.findById(id)
    .then((post) => {
      if (post) {
        console.log(`Post sent! (id ${id})`);
        res.status(200).json(post);
      } else {
        console.log(`Post not found! (id ${id})`)
        res.status(400).json({ message: 'Post not found!' });
      }
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error fetching post!" });
    });
};
