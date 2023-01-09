//demo
const tripM = require('../models/trip.model')
const siteM = require('../models/site.model')


module.exports = {
    showAllTrips: async (req, res, error) => {
        // Load all trips from db
        var trips = await tripM.allLean();

        // Render to view
        res.render('alltrips', {
            user: req.cookies.user,
            trip: trips
        });
    },
    showATrip: async (req, res, error) => {
        // Load a trip from db
        var trip = await tripM.selectLean("_id", req.params.id);

        if (trip) {
            // Load host
            var host = await siteM.selectLean("_id", trip.host)

            // Load tripmates
            var tripmates = [];

            for (const tripmateID of trip.tripmates) {
                var tmp = await siteM.selectLean("_id", tripmateID);
                tripmates.push(tmp);
            }

            // Render to view
            res.render('trip', {
                user: req.cookies.user,
                trip: trip,
                host: host,
                tripmate: tripmates
            });
        }
        else {
            res.status(404);
        }

    },
    createBasicTrip: async (req, res, error) => {
        try {
            const leaderID = req.cookies.user._id;
            const tripTitle = req.body.title;
            const tripDate = req.body.dep_date;

            const trip = {
                title: tripTitle,
                dep_date: tripDate,
                host: leaderID
            }
            console.log(trip);
            const addTrip = await tripM.add(trip);
            res.render('createtripdetail', {
                tripID: addTrip._id
            });
        } catch (error) {
            next(error);
        }
    },
    createDetailTrip: async (req, res, error) => {
        try {
            console.log('req.body: ',req.body);
            var total_days = null;
            if (req.body.total_days.length===1) {
                total_days=[req.body.total_days];
            }else{
                total_days=req.body.total_days;
            }

            var sum_total_days = 0;
            for (let index = 0; index < total_days.length; index++) {
                sum_total_days = sum_total_days + parseInt(total_days[index]);
            }

            var category = null;
            if (req.body.category.length===1) {
                category=[req.body.category];
            }else{
                category=req.body.category;
            }
 
            var accommodation = null;
            if (req.body.accommodation.length===1) {
                accommodation=[req.body.accommodation];
            }else{
                accommodation=req.body.accommodation;
            }

            var location = null;
            if (req.body.location.length===1) {
                location=[req.body.location];
            }else{
                location=req.body.location;
            }

            var description = null;
            if (req.body.description.length===1) {
                description=[req.body.description];
            }else{
                description=req.body.description;
            }
            var imgs = [];
            for (let index = 0; index < req.files.img.length; index++) {
                imgs[index] = req.files.img[index].originalname;
                
            }
            const tripID = req.params.tripID;
            const tripDB = await tripM.select("_id", tripID);
            console.log(tripDB);
            tripDB.imgs = imgs;
            tripDB.type = req.body.type;
            tripDB.duration = sum_total_days;
            tripDB.location = "Vietnam";
            tripDB.price = parseInt(req.body.price);
            tripDB.category = category;
            tripDB.accommodation = accommodation;
            tripDB.tripdescription = req.body.trip_des;
            tripDB.shortdescription = req.body.short_des;
            tripDB.total_tripmates = req.body.total_tripmates;
            tripDB.total_stop = req.body.total_days.length;
            console.log(tripDB);
            for (let index = 0; index < req.body.total_days.length; index++) {
                tripDB.itinerary[index] = {
                    no: index + 1,
                    img: req.files.stop_image[index].originalname,
                    location: location[index],
                    content: description[index],
                    //chỗ này nó tự thêm 1 field _id nữa nè
                }
            }
            tripDB.included = {
                accommodation: false,
                food: false,
                transportation: false,
                ticket: false,
            }
            for (let index = 0; index < req.body.included.length; index++) {
                const type = req.body.included[index];
                if (type === "accommodation") {
                    tripDB.included.accommodation = true;
                }
                if (type === "food") {
                    tripDB.included.food = true;
                }
                if (type === "transportation") {
                    tripDB.included.transportation = true;
                }
                if (type === "ticket") {
                    tripDB.included.ticket = true;
                }
            }
            console.log(tripDB);
           // await tripM.update("_id",tripID,tripDB)
            res.render('home')
        } catch (error) {
            next(error);
        }
    }

}