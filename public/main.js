var app = new Vue({
	el: "#app",
	data: {
		url: "https://api.myjson.com/bins/14hs20",
		activities: [],
		allActivities: [],
		data: {},
		name: 'login',
		userLogged: false,
		loadingPost: false,
		messages: [],
		currentView: "index",
		seen: false,
		text: {},
		description: '',
		selectedDate: '',
		date: '',
	},

	created() {
		//		this.getActivitiesData();
		this.checkIfUserLoggedIn();
	},
	methods: {
		getActivitiesData() {
			firebase.database().ref('activities').on('value', function (data) {
				console.log(data.val())
				app.allActivities = data.val();
				app.myFunction();
			})
			//			fetch(this.url, {
			//					method: "GET"
			//				})
			//				.then(r => r.json())
			//				.then(json => {
			//					app.data = json;
			//				app.activities = json.activities;
			//					app.allActivities = json.activities;
			//					app.date = json.date;
			//
			//					app.getPosts();
			//					
			//					console.log(app.data);
			//
			//				})
			//				.catch(error => console.log(error))
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

			var reference = app.findHashtags(text);

			const userName = firebase.auth().currentUser.displayName;
			const email = firebase.auth().currentUser.email;
			const photoURL = firebase.auth().currentUser.photoURL;

			var post = {
				name: userName,
				body: text,
				email: email,
				image: photoURL,
				result: text,
			};

			console.log(post)

			const newPostKey = firebase.database().ref().child('chat').push().key;

			var updates = {};
			updates["/chat/" + newPostKey] = post;
			document.getElementById("textInput").value = "";

			return firebase.database().ref().update(updates);
			app.getPosts();
		},

		findHashtags(searchtextInput) {
			var regexp = /\B\#\w\w+\b/g
			result = searchtextInput.match(regexp);
			if (result) {
				return result;
			} else {
				return false;
			}
		},


		getPosts: function () {
			app.filterTheHashtagMessages("#Blah");
			firebase.database().ref('chat').on('value', function (data) {


				var userEmail = firebase.auth().currentUser.email;

				var posts = document.getElementById("posts");

				var messages = data.val();
				var allPosts = [];


				for (var key in messages) {
					let element = messages[key];

					var b = app.hashtag(element.body);
					if (b == '<a @click=filterTheHashtagMessages("Blah")>#happy</a>') {
						element["hashtag"] = true
					}

					if (element.email == userEmail) {
						element["user"] = "hostpost";
					} else {
						element["user"] = "otherpost";
					}

					allPosts.push(element);
					console.log(element)
				}
				app.messages = allPosts;
				console.log(app.messages)

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
			//					console.log(view)
			this.currentView = view;
			if (this.currentView == "general") {
				app.seen = true;
				app.getPosts();
			}
			if (this.currentView == 'activities')
				this.getActivitiesData()

		},
		checkIfUserLoggedIn() {
			firebase.auth().onAuthStateChanged(function (user) {
				if (user) {
					app.userLogged = true;
				} else {
					app.userLogged = false;
				}
			});
		},
		filterTheHashtagMessages(hashtag) {
			firebase.database().ref('chat').on('value', function (data) {
				var messageObject = data.val();
				var emptyObject = [];
				for (key in messageObject) {
					var array = messageObject[key].result;
					if (array) {
						for (var i = 0; i < array.length; i++) {
							if (array[i] == hashtag) {
								emptyObject.push(messageObject[key])
							}
						}
					}
				}
				console.log("The array of objects:", emptyObject)
			})
		},
		hashtag(text) {

			var repl = text.replace(/#(\w+)/g, '<a @click=filterTheHashtagMessages("Blah")>#$1</a>');
			return repl;
			//					var linkingTheText = document.getElementById("text");
			//					linkingTheText.innerHTML = repl;
		},


		myFunction() {
			$('#example3').calendar({
				type: 'date'
			});
		},




		getSelectedActivities() {
			var activities = this.allActivities;
			var filteredActivities = [];

			var selectedDate = $('#example3 input').val()

			for (var i = 0; i < activities.length; i++) {
				if (activities[i].date == selectedDate) {
					filteredActivities.push(activities[i]);
				}
			}
			if (selectedDate == "all") {
				filteredActivities = this.allActivities;
			}
			this.activities = filteredActivities;
			console.log(filteredActivities)
		},




	}
});
