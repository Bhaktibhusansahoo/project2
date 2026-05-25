const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// ================= LISTING SCHEMA =================

const listingSchema = new Schema({

/* ================= TITLE ================= */

title:{
type:String
},

/* ================= DESCRIPTION ================= */

description:{
type:String
},

/* ================= IMAGE ================= */

image:{

url:{
type:String
},

filename:{
type:String
}

},

/* ================= PRICE ================= */

price:{
type:Number
},

/* ================= LOCATION ================= */

location:{
type:String
},

/* ================= COUNTRY ================= */

country:{
type:String
},

/* ================= MAP GEOMETRY ================= */
/* STORE LATITUDE + LONGITUDE */

geometry:{

/* GEOJSON TYPE */

type:{

type:String,

enum:["Point"],

default:"Point"

},

/* COORDINATES */
/* FORMAT = [LONGITUDE , LATITUDE] */

coordinates:[

Number

]

},

/* ================= OWNER ================= */

owner:{

type:Schema.Types.ObjectId,

ref:"User"

},

/* ================= REVIEWS ================= */

reviews:[

{

type:Schema.Types.ObjectId,

ref:"Review"

}

]

},

{

timestamps:true

}

);

// ================= EXPORT MODEL =================

const Listing = mongoose.model(
"Listing",
listingSchema
);

module.exports = Listing;