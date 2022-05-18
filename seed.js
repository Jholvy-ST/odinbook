require('dotenv').config();
const faker = require('faker');
const User = require('./models/user');
var mongoose = require('mongoose');
const dev_db_url  = process.env.DBURL;
const mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const seed = () => {
  try {
    
    // Declare a variable and set it equal to an array. 
    let users = []
    
    // This for loop decides how many datapoints you will create.
    // If you want to change the amount, just change the number in the for loop!
    for (let i = 0; i < 10; i++) {
			
			
				const user = new User(
					{
						uid: faker.uid,
						email: faker.internet.email(),
						name: faker.name.findName(),
						gender: "male",
						pic: faker.image.business(),
					}
				)

				console.log(user)
				user.save()
					
			
      
      // The keys in this user object are set equal to the fake information
      
      
      // For each fake user you create, you're going to push them into the user array you declare above
			/*console.log(i)
      users.push(user)*/
    }

    // For each user in the array, you are going to create a new user instance in the database
    /*users.forEach(async (user) => {
      await user.save(function(err) {
				if (err)
						throw err;
			});
			//await User.create(user)
				

      
    })*/
   } catch(err) {
      console.log(err)
   }
}   

seed();