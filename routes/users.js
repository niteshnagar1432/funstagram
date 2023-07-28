var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/funstagram');

var userSchema = mongoose.Schema({
  name:String,
  bjectType:{
    type:String,
    default:'account'
  },
  username:String,
  email:String,
  password:String,
  bio:String,
  gender:String,
  profile:{
    type:Array,
    default:[
      {url:'6726762716.png',time:Date.now},
    ]
  },
  admin:{
    type:Boolean,
    default:false
  },
  post:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'posts',
  }],
  comment:{
    type:Array,
    default:[]
  },
  story:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'story'
  }],
  following:{
    type:Array,
    default:[]
  },
  folower:{
    type:Array,
    default:[]
  },
  time:{
      type:Date,
      default: Date.now,
  },
  saved:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'posts',
  }]
});

userSchema.plugin(plm);

module.exports = mongoose.model('users',userSchema);
