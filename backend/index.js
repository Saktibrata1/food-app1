const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Stripe = require('stripe')



const app = express();



// Configure CORS to allow requests from your frontend domain
const corsOptions = {
  origin: "https://food-app-frntend.onrender.com"
};

app.use(cors(corsOptions));


app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;

const dbUrl = process.env.DB_URL;
require('dotenv').config({ path: 'config.env' });

//mongodb connection
mongoose.set("strictQuery", false);
mongoose
  .connect(dbUrl || "mongodb+srv://Saktibrata:OHF67pe9YLd8U4uJ@food-app.b9pl8l6.mongodb.net/")
  .then(() => console.log("Connect to Databse"))
  .catch((err) => console.log(err));

//schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});

//
const userModel = mongoose.model("user", userSchema);

//api
app.get("/", (req, res) => {
  res.send("Server is running");
});

//sign up
app.post("/signup", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await userModel.findOne({ email: email });

    if (result) {
      res.send({ message: "Email id is already registered", alert: false });
    } else {
      const data = userModel(req.body);
      const save = await data.save();
      res.send({ message: "Successfully signed up", alert: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


//api login
app.post("/login", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await userModel.findOne({ email: email });

    if (result) {
      const dataSend = {
        _id: result._id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        image: result.image,
      };
      console.log(dataSend);
      res.send({
        message: "Login is successful",
        alert: true,
        data: dataSend,
      });
    } else {
      res.send({
        message: "Email is not registered, please sign up",
        alert: false,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


//product section

const schemaProduct = mongoose.Schema({
  name: String,
  category:String,
  image: String,
  price: String,
  description: String,
});
const productModel = mongoose.model("product",schemaProduct)



//save product in data 
//api
app.post("/uploadProduct",async(req,res)=>{
    // console.log(req.body)
    const data = await productModel(req.body)
    const datasave = await data.save()
    res.send({message : "Upload successfully"})
})

//
app.get("/product",async(req,res)=>{
  const data = await productModel.find({})
  res.send(JSON.stringify(data))
})
 
/*****payment getWay */
console.log("sk_test_51NaAYMSBLv0rHLAha1c76QIDBG6etxlUrE0nACYKwhewzWJxmtq5l99mwLHOAfAHEYy8TakfZzLD3kixxW9NHBjG00UlJjcIYn")


const stripe  = new Stripe("sk_test_51NaAYMSBLv0rHLAha1c76QIDBG6etxlUrE0nACYKwhewzWJxmtq5l99mwLHOAfAHEYy8TakfZzLD3kixxW9NHBjG00UlJjcIYn")

app.post("/create-checkout-session",async(req,res)=>{

     try{
      const params = {
          submit_type : 'pay',
          mode : "payment",
          payment_method_types : ['card'],
          billing_address_collection : "auto",
          shipping_options : [{shipping_rate : "shr_1NaNpISBLv0rHLAhWzyzR1xd"}],

          line_items : req.body.map((item)=>{
            return{
              price_data : {
                currency : "inr",
                product_data : {
                  name : item.name,
                  // images : [item.image]
                },
                unit_amount : item.price * 100,
              },
              adjustable_quantity : {
                enabled : true,
                minimum : 1,
              },
              quantity : item.qty
            }
          }),

          success_url : `http://localhost:3000/success`,
          cancel_url : `http://localhost:3000/cancel`,

      }

      
      const session = await stripe.checkout.sessions.create(params)
      // console.log(session)
      res.status(200).json(session.id)
     }
     catch (err){
        res.status(err.statusCode || 500).json(err.message)
     }

})


//server is ruuning
app.listen(PORT, () => console.log("server is running at port : " + PORT));
