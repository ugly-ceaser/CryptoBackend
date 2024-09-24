const cron = require('node-cron');
const userModel = require('../model/userModel');
const depositModel = require("../model/depositModel");


const fetchUserDetails = async (req, res) => 
{
    const userId =  req.params.userId ;
   // console.log(userId)

    const userDetails = await userModel.findOne({userId})

   // console.log(userDetails)

    if(!userDetails){
        return res.status(404).json({
            success: false,
            message: 'User not found'
        })
    
    }else{
        return res.status(200).json({
            success: true,
            message: userDetails
        })      
}

}

const updateUserDetails = async (req, res) => {
    const userData = req.body;
    const updateFields = {};
  
    // Check if userData.username is provided and not empty
    if (userData.username) {
      updateFields.username = userData.username;
    }
  
    // Check if userData.email is provided and not empty
    if (userData.email) {
      updateFields.email = userData.email;
    }
  
    // Check if userData.phone is provided and not empty
    if (userData.phone) {
      updateFields.phone = userData.phone;
    }
  
    if (Object.keys(updateFields).length === 0) {
      // No valid fields to update
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }
  
    try {
      // Check if the user exists
      const existingUser = await userModel.findOne({ userId: userData.userId });
  
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
      // Update the specified fields
      Object.assign(existingUser, updateFields);
      const updatedUser = await existingUser.save();
  
      return res.status(200).json({
        success: true,
        message: 'User details updated successfully',
        updatedUser: updatedUser,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
  




  const getTotalDeposit = async (userId) => {
    try {
      // Fetch all deposits for the particular user based on the user ID
      const deposits = await depositModel.find({ userId, status: "approved" });
  
      // Calculate the total amount deposited by the user
      let totalAmount = 0;
      deposits.forEach((deposit) => {
        totalAmount += parseFloat(deposit.amount);
      });
  
      // Return the total amount
      return totalAmount;
    } catch (error) {
      console.error("Error while fetching total deposit:", error);
      return 0; // Return 0 in case of an error
    }
  };
  
  

  function calculateRandomProfit(userPackage) {
    let randomProfit = 0;
  
    switch (userPackage) {
      case 'arbitrage':
        randomProfit = (Math.random() - 0.5) * 5; // Random value between -5 and 5
        break;
      case 'high frequency':
        randomProfit = (Math.random() - 0.5) * 6; // Random value between -6 and 6
        break;
      case "guy's":
        randomProfit = (Math.random() - 0.5) * 7; // Random value between -7 and 7
        break;
      default:
        randomProfit = (Math.random() - 0.5) * 5; // Random value between -3 and 3
    }
  
    return randomProfit;
  }
  
  // Function to update user profit for all users
  const updateAllUserProfits = async () => {
    try {
      // Fetch all users from the database
      const users = await userModel.find();
  
      if (users.length === 0) {
        console.log('No users found to update profit');
        return;
      }
  
      // Iterate over each user and update their profit
      for (const user of users) {
        const userTotal = await getTotalDeposit(user.userId);

        // console.log(userTotal)

        // console.log({...user})
  
        if (user.initialDeposit && userTotal > 0) {
          const randomProfit = calculateRandomProfit(user.package);
          const profitToAdd = (randomProfit / 100) * userTotal;
          user.profit += profitToAdd; // Update the user's profit
  
          try {
            await user.save(); // Save the updated user
            // console.log(`Updated profit for user ${user.username}: ${profitToAdd}`);
          } catch (error) {
            console.error(`Failed to update profit for user ${user.username}: ${error.message}`);
          }
        }
      }
  
      // console.log('All user profits updated successfully');
    } catch (err) {
      console.error('Error updating user profits:', err.message);
    }
  };

// Schedule a cron job to run every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily user profit update...');
  await updateAllUserProfits();
});

module.exports = updateAllUserProfits;
  
// cron.schedule('* * * * * *', async () => {
//   console.log('Running user profit update...');
//   await updateAllUserProfits();
// });

  



module.exports = {
    updateUserDetails,
    fetchUserDetails,
   
  };

