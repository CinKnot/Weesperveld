var app = new Vue({
	el: "#app",
	data: {
		url: "https://api.myjson.com/bins/14hs20",
		activities: [],
		data: {},
		name: 'login',
		userLogged: false,
		loadingPost: false,
		messages: [],
		currentView: "index",
	},
	created() {
		this.getActivitiesData();
		this.checkIfUserLoggedIn();
	},
	methods: {
		getActivitiesData() {

			fetch(this.url, {
					method: "GET",
				})
				.then(r => r.json())
				.then(json => {
					app.data = json;
					app.getPosts();
					console.log(app.data);

				})
				.catch(error => console.log(error))
		},
		login() {
			var provider = new firebase.auth.GoogleAuthProvider();

			firebase.auth().signInWithPopup(provider);

			console.log("login");
			app.getPosts();
			app.userLogged = true;
		},
		writeNewPost() {

			if (!$("#textInput").val()) {
				return
			}
			const text = document.getElementById("textInput").value;
			const userName = firebase.auth().currentUser.displayName;
			const email = firebase.auth().currentUser.email;
			const photoURL = firebase.auth().currentUser.photoURL;
			var post = {
				name: userName,
				body: text,
				email: email,
				image: photoURL,
			};

			const newPostKey = firebase.database().ref().child('chat').push().key;

			var updates = {};
			updates["/chat/" + newPostKey] = post;
			document.getElementById("textInput").value = "";

			return firebase.database().ref().update(updates);
			app.getPosts();
		},
		getPosts: function () {
			firebase.database().ref('chat').on('value', function (data) {

				var userEmail = firebase.auth().currentUser.email;

				var posts = document.getElementById("posts");

				var messages = data.val();
				var allPosts = [];


				for (var key in messages) {
					let element = messages[key];

					if (element.email == userEmail) {
						element["user"] = "hostpost";
					} else {
						element["user"] = "otherpost";
					}
					allPosts.push(element);

				}
				app.messages = allPosts;

				setTimeout(function () {
					$("#chat-window").animate({
						scrollTop: $("#chat-window").prop("scrollHeight")
					});
					//					app.loadingPost = false;
				}, 500)


			})
		},
		logout() {
			firebase.auth().signOut();
			app.userLogged = false;
		},
		setcurrentView(view) {
			console.log(view)
			this.currentView = view;
			if (this.currentView == "general") {
				app.getPosts();
			}

		},
		checkIfUserLoggedIn() {
			firebase.auth().onAuthStateChanged(function (user) {
				if (user) {
					app.userLogged = true;
				} else {
					app.userLogged = false;
				}
			});
		}
	}
});
