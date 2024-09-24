const userModel = require("../model/userModel");
const depositModel = require("../model/depositModel");
const emailService = require("../server");

const depositHandler = async (req, res) => {
  try {
    const depositData = req.body;

    const userObj = await userModel.findOne({ userId: depositData.userId });

    if (!userObj) {
      return res.status(404).json({
        success: false,
        message: "User not found for the given userId",
      });
    }

    const userName = userObj.username;

    const deposit = await depositModel.create({
      userId: depositData.userId,
      amount: depositData.amount,
      transactionId: depositData.transactionId,
      package: depositData.package,
      username: userName,
    });

    const updatedUser = await userModel.findOneAndUpdate(
      { userId: depositData.userId },
      { $set: { package: depositData.package } },
      { new: true }
    );

    if (deposit) {
      await Promise.all([
        emailService.sendDepositRequest(userObj, depositData.amount),
        emailService.notifyAdminAboutWithdrawal(userObj, depositData.amount),
      ]);
    }

    res.status(201).json({
      success: true,
      data: {
        deposit,
        updatedUser,
      },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllDeposits = async (req, res) => {
  try {
    const userId = req.params.userId;
    // console.log(userId)

    const deposits = await depositModel.find({ userId });

    // console.log(deposits)

    res.status(200).json({
      success: true,
      message: deposits,
    });
  } catch (error) {
    console.error("Error while fetching deposits:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTotalDeposit = async (req, res) => {
  try {
    // Retrieve the user ID from the session
    const userId = req.params.userId;

    // Fetch all deposits for the particular user based on the user ID
    const deposits = await depositModel.find({ userId, status: "approved" });

    // Calculate the total amount deposited by the user
    let totalAmount = 0;
    deposits.forEach((deposit) => {
      totalAmount += parseFloat(deposit.amount);
    });

    res.status(200).json({
      success: true,
      message: totalAmount,
    });
  } catch (error) {
    console.error("Error while fetching total deposit:", error);
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

module.exports = {
  depositHandler,
  getAllDeposits,
  getTotalDeposit,
};
