// use testdb;
db.students.insertOne({name: 'Tan'});
db.students.drop();
db.students.find();


db.students.insertOne({
    name: 'Nguyen Duc Tan',
    dateOfBirth: new Date('1998-09-19'),
    email: 'ductan@gmail.com',
    address: 'Bachmai street, Han, Vietnam'
})


db.students.insertMany([
    {
        name: 'Firgo',
        dateOfBirth: new Date('1993-10-22'),
        email: 'firgo12@gmail.com',
        address: 'street A, road B, Sweden'
    },
        {
        name: 'Pter Norton',
        dateOfBirth: new Date('2000-02-11'),
        email: 'peternotrotn@gmail.com',
        address: 'some where in the world'
    }
])
db.students.find();


// ========================================
//          SCHEMA VALIDATION
// ========================================
db.createCollection('courses', {
    validator: {
        $jsonSchema:{
            bsonType: 'object', //binary json(Javascript Object Notation)
            title: 'Validate Course object',
            properties: {
                title: {
                    bsonType: 'string',
                    description: "title must be a string"                    
                },
                hours: {
                    bsonType: 'int',
                    minimum: 3,
                    maximum: 100,
                    description: "hours must be between 3 and 100"                    
                },
                startDate: {
                    bsonType: ['date'],
                    description: 'Incorrect date type'
                },
                price: {
                    bsonType: ['int', 'double'],
                    description: 'price must be a number'
                }
            }
        }
    }
})


db.courses.insertOne({
   title: 'Java programming language for beginners',
   hours: 50,
   startDate: new Date('2023-02-10')
})

db.courses.insertOne({
   title: 'Mobile game with Unity',
   hours: 90,
   startDate: new Date('2023-02-10'),
   price: 123.2
})

db.courses.find().count()
db.courses.find().limit(1)


// ========================================
//          GET DETAIL VALIDATIONS
// ========================================
db.getCollectionInfos({name: 'courses'})[0].options.validator["$jsonSchema"].properties


// ========================================
//          Update schema validation
// ========================================
db.runCommand({
   collMod: "courses", //collection modify
   validator: {
       $jsonSchema: {
           bsonType: 'object',
           properties: {
               hours: {
                   bsonType: 'int',
                   minimum: 3,
                   maximum: 200,
                   description: "hours must be between 3 and 200"                    
               },
           }
       }
   }
})

db.getCollectionInfos({name: 'courses'})[0].options.validator["$jsonSchema"].properties
//data is small, please import sample data


//use sample_mflix
//show collections
//show movies which has year in [2000, 2018]
db.movies.find({
    year: {
        $gte: 2016, //greater than or equals    // $gte: lớn hơn hoặc bằng
        $lte: 2018, //less than or equals       // $lte: be hơn hoặc bằng
    }
}, {                                            // Chỉ lấy những thuộc tính sau 
    plot: 1,
    year: 1,    
})

// ========================================
// which movies' types we have:
// ========================================
db.movies.distinct("type")                     // distinct: Lấy những bản ghi ko trùng
db.movies.find({
    "tomatoes.viewer.rating": 5
}, {
    tomatoes: 1
})

db.movies.find({
    "tomatoes.viewer.rating": {
        $gte: 5                                 // $gte: lớn hơn hoặc bằng
    }
}, {                                            // Chỉ hiện mỗi thuộc tính "tomatoes" 
    tomatoes: 1
})


// ==============================================
// Kiểm tra maximun của rating là bao nhiêu
// what is the maximum of "tomatoes.viewer.rating"
// ==============================================
db.movies.find({
    "tomatoes.viewer.rating": {
        $exists:true                                            // $exists: điều kiện kiểm tra dữ liệu có tồn tại
    }
}).sort({"tomatoes.viewer.rating": -1}).limit(1)                // -1: sort theo thứ tự giảm dần

// ==============================================
// Kiểm tra minimum của rating là bao nhiêu
// what is the min of "tomatoes.viewer.rating"
// ==============================================
db.movies.find({
    "tomatoes.viewer.rating": {
        $exists:true
    }
}).sort({"tomatoes.viewer.rating": 1}).limit(1)                 // 1: sort theo thứ tự tăng dần


db.movies.find({
    directors: {
        $in: ["William K.L. Dickson", "Edwin S. Porter"]        // Tìm những ông đạo diễn có tên này 
    }
}, {                                                            // Chỉ hiện mỗi thuộc tính này
    title: 1,
    year: 1,
    directors: 1
})


// ==============================================
//  show all movies which has only 1 director
// ==============================================
db.movies.find({
    directors: {
        $size: 1
    }
}, {                                                           // Chỉ hiện mỗi thuộc tính này
    title: 1,
    year: 1,
    directors: 1
})


// ==============================================
//                  find by Id
// ==============================================
db.movies.find({
    _id: ObjectId("573a1390f29313caabcd680a"),
})


// ==============================================
//              calculated fields
// ==============================================
db.movies.find({}, {
    title: 1,
    year: 1,
    directors: 1,
    numberOfDirectors: {$size: "$directors"}                    // {$size: "$directors"}: độ dài của array đó
})


// ==============================================
//       skip, limit => paging (phân trang)
// ==============================================
//first page, 5 items
db.movies.find({},{title: 1}).skip(0).limit(5)
//second page
db.movies.find({},{title: 1}).skip(5).limit(5)
//third page
db.movies.find({},{title: 1}).skip(10).limit(5)
//forth page
db.movies.find({},{title: 1}).skip(15).limit(5)



// ==============================================
//  Aggregate, something better than "find"             // db.comment.aggregate => lệnh này giống như lệnh find()
//  PIPELINE ! (làm việc tuần tự)
// ==============================================
db.movies.aggregate([                                   // Danh sách đầu vào của aggregate là 1 mảng
    //stage 1
    {
        $match: {                                       //  $match: chỉ áp dụng cho aggregate, ko dùng cho find() vì phần tự đầu tiên mặc định là match rồi
            _id: ObjectId("573a1390f29313caabcd680a")
        }
    },    
    //stage 2
    {
        $project: {                                     // $project: giống như câu lệnh SELECT trong SQL
            _id: 0,                                     // tắt thuộc tính _id
            title: 1,
            year: 1,
            directors: 1
        }
    }    
])


db.comments.aggregate(                                  // aggregate: ko dùng được 'count' nên phải dùng 'toArray()'
    {
        $match: {                                       // $match: chỉ áp dụng cho aggregate, ko dùng cho find() vì phần tự đầu tiên mặc định là match rồi
            email: 'sophie_turner@gameofthron.es'
        }
    }
).toArray().length


// -------------------------------
// AND, OR, ....
db.movies.aggregate([
    //stage 1
    {
        $match: {
            $and: [                
                {
                    type: 'movie'
                },
                {
                    year: {
                        $in: [1917, 1997]
                    }
                }
                /*
                {
                    $or: [
                        {
                            year: 1917
                        },
                        {
                            year: 1997
                        }
                    ]
                }
                */
            ]
        }
    },
    //stage 1
    {
        $project: {
            title: 1,
            year: 1,
            type: 1
        }
    }
]).toArray().length


// -------------------------------
//2 movies has Many comments
db.comments.aggregate([
    {
        $group: {
            _id: "$movie_id",                   // lấy trường movie_id
            numberOfComments: {                 // Tỉnh tổng comment
                $count: {}
            }
        }
    },  
    {
        $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "detailMovie"
        }
    } 
])


db.comments.aggregate([
    {
        $match: {
            //i = ignore case
            //text: /.*Veritatis eos impedit.*/i //text contains ...
            //text: /^Nihil asperiores.*/i //text starts with ...
            text: /.*reprehenderit error\.$/i //text ends with ...
        }
    },
    {
        $sort: {
            name: -1
        }
    }
])


// --------------------------------------
//Add more fields to the stage
db.movies.aggregate([
    //stage 1
    {
        $match: {
            writers: {$exists: true},
            awards: {$exists: true},
        }
    },
    //stage 2
    {
        $addFields: {                                   // Thêm trường vào 
            numberOfWriters: {$size: "$writers"},
            numberOfAwards: "$awards.wins"
        }
    },
    {
        $match: {
            numberOfAwards: {$gt: 1}
        }
    }
])


// --------------------------------------
//Find movies with more than 1 genres
db.movies.aggregate([
    {
        $match: {
            "genres.1": {                               // Kiểm tra phần tử số 2 trong mảng có tồn tại hay không ?
                //second item of genres is "exist"
                $exists: true
            }
        }
    }
])


// -------------------------------
//unwind => flattern (làm phẳng)   => tách bản ghi  VD: 1 array có 3 phần tử thì nó tách ra làm 3 cái khác nhau 
db.movies.aggregate([
    {
        $unwind: "$genres"
    }
]).toArray().length



// -------------------------------
//no "unwind"
db.movies.aggregate([
        
]).toArray().length



// -------------------------------
// updateOne, updateMany
db.movies.updateOne({
    _id: ObjectId("573a1390f29313caabcd548c"),    
}, {
    $set: {                                         // Những phần thông tin sẽ thay đổi
        year: 1916,
        "imdb.rating": 6.9,        
    },
    $currentDate: {lastupdated: true}               // Update ngày giờ hiện tại
})



// -------------------------------
// replaceOne  => Hạn chế dùng
db.movies.replaceOne({
    _id: ObjectId("573a1390f29313caabcd548c"),    
}, {
    year: 1916,
    "imdb.rating": 6.9,        
}, {
    upsert: true //insert if not found              // Tự động thêm mới vào nếu ko tìm thấy
})



// -------------------------------
//try with replaceOne, 
db.movies.find({
    _id: ObjectId("573a1390f29313caabcd548c"),    
})



// -------------------------------
// deleteMany
db.movies.deleteMany({
    _id: ObjectId("573a1390f29313caabcd548c"),    
})















