const internModel = require('../models/internModel');
const collegeModel = require('../models/collegeModel');

const {
  objectValue,
  nameRegex,
  emailRegex,
  keyValue,
  mobileRegex,
} = require('../middleware/validator'); // IMPORTING VALIDATORS

// V = Validator

//------------------------------------------------------------------------------------//

const createIntern = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  try {
    const { isDeleted, name, email, mobile, collegeName } = req.body; // Destructuring

    if (!keyValue(req.body))
      return res
        .status(400)
        .send({ status: false, msg: 'All fields are empty!' }); // 3rd V used here

    let collegeNameInLowerCase = collegeName;

    if (!objectValue(collegeNameInLowerCase))
      return res
        .status(400)
        .send({ status: false, msg: 'collegeName is required!' });
    // 2nd V used above

    collegeNameInLowerCase = collegeName.toLowerCase(); // input in Lower case

    if (isDeleted === '') {
      if (!objectValue(isDeleted))
        return res
          .status(400)
          .send({ status: false, msg: 'isDeleted is invalid!' });
    } // 2nd V used here

    if (isDeleted && typeof isDeleted !== 'boolean')
      return res.status(400).send({
        status: false,
        msg: 'isDeleted should be either true or false!',
      });

    if (!objectValue(name))
      return res.status(400).send({ status: false, msg: 'name is required!' }); 
      // 2nd V used here

    if (!nameRegex(name))
      return res.status(400).send({
        status: false,
        msg: 'name must be in alphabet and at least of 2 characters!',
      }); // 4th V used above

    if (!objectValue(email))
      return res.status(400).send({ status: false, msg: 'email is required!' }); 
      // 2nd V used here

    if (!emailRegex(email))
      return res.status(400).send({ status: false, msg: 'email is invalid!' }); 
      // 6th V used here

    const duplicateEmail = await internModel.findOne({ email });

    if (duplicateEmail)
      return res
        .status(400)
        .send({ status: false, msg: 'This email is already used!' });

    if (!objectValue(mobile))
      return res
        .status(400)
        .send({ status: false, msg: 'mobile number is required!' }); // 2nd V used here

    if (!mobileRegex(mobile))
      return res
        .status(400)
        .send({ status: false, msg: 'mobile number is invalid!' }); // 7th V used here

    const duplicateMobile = await internModel.findOne({ mobile });

    if (duplicateMobile)
      return res
        .status(400)
        .send({ status: false, msg: 'This mobile number is already used!' });

    const validCollegeId = await collegeModel.findOne({
      name: collegeNameInLowerCase,
      isDeleted: false,
    });

    if (!validCollegeId)
      return res.status(404).send({
        status: false,
        msg: `There is no such college present with the name ${collegeNameInLowerCase} in the Database!`,
      });

    let collegeId = validCollegeId._id;

    const internCreation = await internModel.create({
      isDeleted: isDeleted,
      name: name,
      email: email,
      mobile: mobile,
      collegeId: collegeId,
    });

    return res.status(201).send({
      status: true,
      data: {
        isDeleted: internCreation.isDeleted,
        name: internCreation.name,
        email: internCreation.email, // Destructuring
        mobile: internCreation.mobile,
        collegeId: collegeId,
      },
    });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

//------------------------------------------------------------------------------------//

const getCollegeDetails = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  try {
    let data = req.query.collegeName;

    if (!data)
      return res.status(400).send({
        status: false,
        msg: 'please enter key as collegeName and define some value!',
      });

    data = data.toLowerCase();

    const college = await collegeModel.findOne({ name: data });

    if (!college)
      return res
        .status(404)
        .send({ status: false, msg: 'no such college present!' });

    const intern = await internModel
      .find({ collegeId: college._id, isDeleted: false })
      .select({ collegeId: 0, __v: 0, isDeleted: 0 });

    if (!keyValue(intern))
      return res
        .status(404)
        .send({ status: false, msg: `${data} does not have any interns!` });
    // 3rd V used here

    res.status(200).send({
      status: true,
      data: {
        name: college.name,
        fullName: college.fullName, // Destructuring
        logoLink: college.logoLink,
        interns: intern,
      },
    });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { createIntern, getCollegeDetails };
