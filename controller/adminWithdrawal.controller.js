// withdrawal.controller.js

const Withdrawal = require("../model/withdrawalModel");
const User = require("../model/userModel");
const emailService = require("../server");

// Get all withdrawal requests
const fetchAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find();

    res.status(200).json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const fetchAllPendingWithdrawals = async (req, res) => {
  try {
    const Pendingwithdrawals = await Withdrawal.find({ status: "pending" });

    res.status(200).json({
      success: true,
      Pendingwithdrawals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTotalWithdrawal = async (req, res) => {
  try {
    // Fetch all deposits with 'approved' status
    const withdrawals = await Withdrawal.find({ status: "approved" });

    // Calculate the total amount of all approved deposits
    let totalAmount = 0;
    withdrawals.forEach((withdrawal) => {
      totalAmount += parseFloat(withdrawal.amount);
    });

    res.status(200).json({
      success: true,
      totalAmount,
    });
  } catch (error) {
    console.error("Error while fetching total withdrawal:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTotaPendinglWithdrawal = async (req, res) => {
  try {
    // Fetch all deposits with 'approved' status
    const withdrawals = await Withdrawal.find({ status: "pending" });

    // Calculate the total amount of all approved deposits
    let totalAmount = 0;
    withdrawals.forEach((withdrawal) => {
      totalAmount += parseFloat(withdrawal.amount);
    });

    res.status(200).json({
      success: true,
      totalAmount,
    });
  } catch (error) {
    console.error("Error while fetching total deposit:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update the status of a withdrawal request (approve/decline)
const handleWithdrawal = async (req, res) => {
  const transactionId = req.params.transactionId;
  const status = req.params.status;

  try {
    const withdrawal = await Withdrawal.findOneAndUpdate(
      { transactionId },
      { $set: { status } },
      { new: true }
    );

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found",
      });
    }

    const user = await User.findOne({ userId: withdrawal.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // send mail to the user and admin
    await emailService.sendWithdrawalStatusUpdate(
      user,
      withdrawal.amount,
      status
    );

    res.status(200).json({
      success: true,
      message: `Withdrawal request ${
        status === "approved" ? "approved" : "declined"
      } successfully`,
      data: withdrawal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getTotalWithdrawal,
  fetchAllWithdrawals,
  fetchAllPendingWithdrawals,
  handleWithdrawal,
  getTotaPendinglWithdrawal,
};
