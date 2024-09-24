const userModel = require("../model/userModel");
const depositModel = require("../model/depositModel");

const { v4: uuidv4 } = require("uuid");
const emailService = require("../server");

function generateUserId() {
  // console.log(uuidv4());
  return uuidv4(); // Generate a random UUID (Universally Unique Identifier)
}

const checkUser = async (req, res) => {
  // console.log(req.body);
  //console.log('Hello checker');
  try {
    const user = req.body;
    const { email } = req.body;

    // Check if the provided email already exists in the database using userModel
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }
    user.userId = generateUserId();

    return res.status(200).json({
      success: true,
      message: "Email is available.",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const initialDeposit = async (req, res) => {
  try {
    const depositDetails = req.body;
    //console.log("hello init depo")
    console.log(depositDetails);

    depositDetails.description = "initial";

    const deposit = await depositModel.create(depositDetails);

    if (deposit) {
      // await sendMail(
      //   "davidsegem@gmail.com",
      //   `deposit:${depositDetails.amount}`,
      //   `${depositDetails.amount} was sent to ur account , confirm and approve`
      // );
    }
    res.status(201).json({
      success: true,
      data: deposit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const handleSignUp = async (req, res) => {
  try {
    const user = req.body;

    console.log(user);

    const userEmail = user.email;
    const userName = user.username;

    const createdUser = await userModel.create(user);

    const userObject = await userModel.findOne({ email: userEmail });

    if (!userObject) {
      // Handle the case where the user is not found
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userId = userObject.userId;
    console.log(`userid :${userId}`);

    // Update the deposit based on userId
    const updateUserDeposit = await depositModel.findOneAndUpdate(
      { userId },
      { username: userName },
      { new: true }
    );

    console.log(updateUserDeposit);

    if (!updateUserDeposit) {
      // Handle the case where the deposit information for the user is not found
      return res.status(404).json({
        success: false,
        message: "Deposit information not found for the user",
      });
    }

    await emailService.sendRegistrationConfirmation(userObject);

    res.status(201).json({
      success: true,
      data: {
        user: createdUser,
        deposit: updateUserDeposit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginHandler = async (req, res) => {
  const userDetails = req.body;
  //console.log("POST [USER]:", userDetails)

  try {
    const user = await userModel.findOne({ email: userDetails.email });

    if (!user) {
      // User with the provided username not found
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const isPasswordValid = userDetails.password === user.password;
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const initialDepositStatus = user.initialDeposit;
    if (!initialDepositStatus) {
      return res.status(401).json({
        success: false,
        message: "please wait for initial deposit to be confirmed and approved",
      });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      userId: user.userId,
    };

    await emailService.sendLoginNotification(user);

    res.status(200).json({
      success: true,
      data: user,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.send(users);
  } catch (error) {
    res.send({ error: error.message });
  }
};

module.exports = {
  handleSignUp,
  initialDeposit,
  checkUser,
  loginHandler,
  getUsers,
};
