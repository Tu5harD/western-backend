const fs = require("fs");
const path = require("path");
var FCM = require("fcm-node");
const Retailer = require("../model/retailer/retailer");

const sendPushNotificationToRetailerForOffers = async (
  title,
  body,
  image = ""
) => {
  try {
    const jsonString = await readFileAsync(
      path.join(__dirname, "../FireBaseConfig.json"),
      "utf8"
    );

    const data = JSON.parse(jsonString);
    const serverKey = data.SERVER_KEY_ANDROID;
    const fcm = new FCM(serverKey);

    const push_tokens = await Retailer.findAll({
      where: {
        retailer_deleted: false,
      },
    });

    const reg_ids = push_tokens.map((token) => token.token);

    if (reg_ids.length > 0) {
      const pushMessage = {
        content_available: true,
        mutable_content: true,
        registration_ids: reg_ids,
        notification: {
          title: title,
          body: body,
          icon: "https://i.imgur.com/A0yoJpV.png",
          image: image,
        },
      };

      return new Promise((resolve, reject) => {
        fcm.send(pushMessage, (err, response) => {
          if (err) {
            console.log("Something has gone wrong!", err);
            reject(err);
          } else {
            console.log("Push notification sent.", response);
            resolve(response);
          }
        });
      });
    }
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
};

module.exports = { sendPushNotificationToRetailerForOffers };
