const { globalError } = require("../../../../../errors/globalError");
const {
  sendPushNotificationToRetailerForOffers,
} = require("../../../../../Notifications/offerNotification");

const newOfferNotification = async (req, res, next) => {
  try {
    const { body, title, image = "" } = req.body;

    const mssg = await sendPushNotificationToRetailerForOffers(
      title,
      body,
      image
    );

    return res.status(201).json({
      success: true,
      message: mssg,
    });
  } catch (error) {
    next(globalError(500, error.message));
  }
};

module.exports = { newOfferNotification };
