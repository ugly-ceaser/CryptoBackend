const withdrawalModel = require("../model/withdrawalModel");
const userModel = require("../model/userModel");
const emailService = require("../server");

const withdrawalHandler = async (req, res) => {
  try {
    const withdrawObject = req.body;

    const user_id = withdrawObject.userId;

    console.log(`user_id : ${user_id}`);

    const user_obj = await userModel.findOne({ userId: user_id });
    console.log(user_obj);
    withdrawObject.username = user_obj.username;
    console.log(withdrawObject);
    const withdrawal = await withdrawalModel.create(withdrawObject);

    if (withdrawal) {
      await Promise.all([
        emailService.sendWithdrawalRequest(user_obj, withdrawObject.amount),
        emailService.notifyAdminAboutWithdrawal(
          user_obj,
          withdrawObject.amount
        ),
      ]);
    }
    res.status(201).json({
      success: true,
      data: withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllWithdrawals = async (req, res) => {
  try {
    const userId = req.params.userId;
    const withdrawals = await withdrawalModel.find({ userId });
    res.status(200).json({
      success: true,
      message: withdrawals,
    });
  } catch (error) {
    console.error("Error while fetching withdrawals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTotalWithdrawal = async (req, res) => {
  try {
    const userId = req.params.userId;
    const withdrawals = await withdrawalModel.find({
      userId,
      status: "approved",
    });

    let totalAmount = 0;
    withdrawals.forEach((withdrawal) => {
      totalAmount += parseFloat(withdrawal.amount);
    });

    res.status(200).json({
      success: true,
      message: totalAmount,
    });
  } catch (error) {
    console.error("Error while fetching total withdrawal:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  withdrawalHandler,
  getAllWithdrawals,
  getTotalWithdrawal,
};
