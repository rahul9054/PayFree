let express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const mongoose = require('mongoose') ;
const User = require('./model') ;
dotenv.config();

mongoose.connect(process.env.MONGO_CONNECTION_URL , {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connected 🥳🥳🥳🥳');
})


// User.find({} , function(err , users){
//    if(err) console.warn(err) ;
// console.warn(users) ;
// })



let app = express();
app.use(express.static('public'));
const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});
//Middlewares
app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.post("/api/payment/order", (req, res) => {
  // console.log(req.body) ;
  params = req.body;
  instance.orders
    .create(params)
    .then((data) => {
      console.log(data);
      res.send({ sub: data, status: "success" , key : process.env.KEY_ID });
    })
    .catch((error) => {
      res.send({ sub: error, status: "failed" });
    });
});





app.post("/api/payment/verify", (req, res) => {
  body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

  var expectedSignature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  console.log("sig" + req.body.razorpay_signature);
  console.log("sig" + expectedSignature);


  var response = { status: "failure"};
  if (expectedSignature === req.body.razorpay_signature){
    response = { status: "success" , code : 200};

    const data = new User({
      _id : new mongoose.Types.ObjectId() ,
      name : req.body.name ,
      Amount : req.body.amount,
      email : req.body.email,
      Phone : req.body.phone,
      BankAccountNo : req.body.bankaccountno
  })
  
  data.save().then((result)=>{
   console.warn(result) ;
  }).catch( err => console.warn(err)) ;

 }
   
    res.send(response);
});
app.listen("7000", () => {
  console.log("server started");
});
