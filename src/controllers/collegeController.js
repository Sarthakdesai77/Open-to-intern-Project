const collegeModel = require('../models/collegeModel');
const axios = require('axios');
const {
  urlRegex,
  objectValue,
  nameRegex,
  collegeRegex,
  keyValue,
} = require('../middleware/validator'); // IMPORTING VALIDATORS

// V = Validator

//------------------------------------------------------------------------------------//

const createCollege = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  try {
    let nameInLowerCase = req.body.name;

    if (!keyValue(req.body))
      return res
        .status(400)
        .send({ status: false, msg: 'All fields are empty!' }); // 3rd V used here

    if (!objectValue(nameInLowerCase))
      return res.status(400).send({ status: false, msg: 'name is required!' }); // 2nd V used here

    nameInLowerCase = nameInLowerCase.toLowerCase(); // input in Lower case

    const { fullName, logoLink, isDeleted } = req.body; // Destructuring

    if (!nameRegex(nameInLowerCase))
      return res.status(400).send({
        status: false,
        msg: 'name must be in alphabet and at least of 2 characters!',
      }); // 4th V used here

    const duplicateName = await collegeModel.findOne({ name: nameInLowerCase });

    if (duplicateName)
      return res
        .status(400)
        .send({ status: false, msg: 'This college name is already used!' });

    if (!objectValue(fullName))
      return res
        .status(400)
        .send({ status: false, msg: 'fullName is required!' }); // 2nd V used here

    if (!collegeRegex(fullName))
      return res.status(400).send({
        status: false,
        msg: 'College full name must be in characters and of at least 5 characters long!',
      }); // 5th V used here

    if (!objectValue(logoLink))
      return res
        .status(400)
        .send({ status: false, msg: 'logoLink is required!' }); // 2nd V used here

    if (!urlRegex(logoLink))
      return res
        .status(400)
        .send({ status: false, msg: 'logoLink is invalid!' }); // 8th V used here

    let validLogolink = false;
    await axios
      .get(logoLink)
      .then((url) => {
        if (url.status === 200 || 201) {
          if (url.headers['content-type'].startsWith('image/'))
            // AXIOS VALIDATION
            validLogolink = true;
        }
      })
      .catch((error) => (validLogolink = false));

    if (validLogolink === false)
      return res.status(404).send({
        status: false,
        msg: 'either logo link is incorrect or does not exist!',
      });

    let duplicateLogoLink = await collegeModel.findOne({ logoLink: logoLink });
    if (duplicateLogoLink)
      return res
        .status(400)
        .send({ status: false, msg: 'logo link already in use!' });

    if (isDeleted === '') {
      // Nested 'if' statement used here
      if (!objectValue(isDeleted))
        return res
          .status(400)
          .send({ status: false, msg: 'isDeleted is invalid!' }); // 2nd V used here
    }

    if (isDeleted && typeof isDeleted !== 'boolean')
      return res.status(400).send({
        status: false,
        msg: 'isDeleted should be either true or false!',
      });

    const collegeData = {
      name: nameInLowerCase,
      fullName,
      logoLink,
      isDeleted,
    };

    const collegeCreation = await collegeModel.create(collegeData);

    const college = await collegeModel
      .findOne({ name: nameInLowerCase })
      .select({ _id: 0, __v: 0 });

    res.status(201).send({ status: true, data: college });
  } catch (error) {
    res.status(500).send({ status: false, msg: error.message });
  }
};

module.exports = { createCollege };
