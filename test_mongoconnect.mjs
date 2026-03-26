import mongoose from 'mongoose';
const uri = "mongodb+srv://ndkhnaq_db_user:K4e5bT5899yqVwM3@cluster0.it0nvah.mongodb.net/tycoon?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
  .then(async () => {
     console.log('connected strictly!');
     process.exit(0);
  })
  .catch(err => {
     console.error('STRICT ERROR:', err);
     process.exit(1);
  });
