Posts = new Meteor.Collection("posts");
if (Meteor.isClient) {
  Meteor.subscribe("posts");
  Meteor.subscribe("allUsers");
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Template.posts.helpers({
    posts: function() {
      return Posts.find({}, {sort: {createdAt: -1}});
    }
  });

  Template.post.helpers({
    author: function() {
      return Meteor.users.findOne({_id: this.createdBy});
    },
    owner: function() {
      return this.createdBy === Meteor.userId();
    }
  });

  Template.createPost.events({
    "click .sendPost": function(e) {
      e.preventDefault();
      var post = $(".postText").val();
      var postTitle = $(".postTitle").val();
      Meteor.call("savePost", post, postTitle, false);
    },
    "click .savePost": function(e) {
      e.preventDefault();
      var post = $(".postText").val();
      var postTitle = $(".postTitle").val();
      Meteor.call("savePost", post, postTitle, true);
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish("posts", function() {
    return Posts.find({
      $or: [
        {draft: false},
        {createdBy: this.userId}
      ]
    });
  });
  Meteor.publish("allUsers", function() {
    return Meteor.users.find({}, {fields: {username: 1}});
  });
}

Meteor.methods({
  savePost: function(post, title, draft) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Posts.insert({
      title: title,
      post: post,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      draft: draft
    });
  }
});
