const { globalError } = require("../../../../../errors/globalError");
const Stock = require("../../../../../model/stock/stock");
const { Op } = require("sequelize");

const updateStockDetailsByStockId = async (req, res, next) => {
  try {
    const {
      stock_id,
      current_stock,
      minimum_stock,
      loose_quantity,
      expiry_date,
      purchase_price,
    } = req.body;

    const value = {
      current_stock,
      minimum_stock,
      loose_quantity,
      expiry_date,
      purchase_price,
    };

    const stock = await Stock.update(value, {
      where: {
        stock_id,
      },
    });

    if (stock[0] === 0) {
      return next(globalError(404, "Stock not found"));
    }
    return res
      .status(200)
      .json({ success: true, message: "Stock successfully updated" });
  } catch (error) {
    next(globalError(500, error));
  }
};

const stockUpdateWhenOrderConfirmed = async (req, res, next) => {
  const t = req.t;
  try {
    const { orderList = [] } = req.body;

    for (const element of orderList) {
      let quantity =
        parseFloat(element.quantity) + parseFloat(element.free_quantity);

      let found = await Stock.findOne({
        where: {
          product_id: element.Product.product_id,
        },
        transaction: t,
      });

      if (!found) {
        await t.rollback();
        return next(globalError(404, "Stock not found"));
      }

      let availableQuantity = 0;

      if (
        element.Product.product_base_unit.toLowerCase() ===
        element.Product.product_secondary_unit.toLowerCase()
      ) {
        availableQuantity = parseFloat(found.current_stock) - quantity;

        const updateStock = await Stock.update(
          { current_stock: availableQuantity },
          { where: { product_id: element.Product.product_id }, transaction: t }
        );

        if (updateStock[0] === 0) {
          await t.rollback();
          return next(globalError(404, "Stock not updated"));
        }
      } else {
        const conversionRate = parseFloat(
          element.Product.product_conversion_rate
        );

        if (parseFloat(found.loose_quantity) == 0) {
          if (quantity === conversionRate) {
            availableQuantity = parseFloat(found.current_stock) - 1;

            const updateStock = await Stock.update(
              { current_stock: availableQuantity },
              {
                where: { product_id: element.Product.product_id },
                transaction: t,
              }
            );

            if (updateStock[0] === 0) {
              await t.rollback();
              return next(globalError(404, "Stock not updated"));
            }
          } else if (quantity > conversionRate) {
            const fullUnits = Math.floor(quantity / conversionRate);
            const remainingLoose = quantity % conversionRate;

            availableQuantity = parseFloat(found.current_stock) - fullUnits;

            const updateStock = await Stock.update(
              {
                current_stock: availableQuantity,
                loose_quantity:
                  availableQuantity == 0 ? -remainingLoose : remainingLoose,
              },
              {
                where: { product_id: element.Product.product_id },
                transaction: t,
              }
            );

            if (updateStock[0] === 0) {
              await t.rollback();
              return next(globalError(404, "Stock not updated"));
            }
          } else {
            const remainingLoose = conversionRate - quantity;
            const updateStock = await Stock.update(
              {
                loose_quantity: remainingLoose,
              },
              {
                where: { product_id: element.Product.product_id },
                transaction: t,
              }
            );

            if (updateStock[0] === 0) {
              await t.rollback();
              return next(globalError(404, "Stock not updated"));
            }
          }
        } else {
          if (quantity <= parseFloat(found.loose_quantity)) {
            const newLooseQuantity =
              parseFloat(found.loose_quantity) - quantity;
            const updateStock = await Stock.update(
              { loose_quantity: newLooseQuantity },
              {
                where: { product_id: element.Product.product_id },
                transaction: t,
              }
            );

            if (updateStock[0] === 0) {
              await t.rollback();
              return next(globalError(404, "Stock not updated"));
            }
          } else {
            const remainingQuantity =
              quantity - parseFloat(found.loose_quantity);
            const fullUnits = Math.floor(remainingQuantity / conversionRate);
            const remainingLoose = remainingQuantity % conversionRate;
            availableQuantity = parseFloat(found.current_stock) - fullUnits;

            const updateStock = await Stock.update(
              {
                current_stock: availableQuantity,
                loose_quantity:
                  availableQuantity == 0 ? -remainingLoose : remainingLoose,
              },
              {
                where: { product_id: element.Product.product_id },
                transaction: t,
              }
            );

            if (updateStock[0] === 0) {
              await t.rollback();
              return next(globalError(404, "Stock not updated"));
            }
          }
        }
      }
    }
    req.t = t;
    return next();
  } catch (error) {
    next(globalError(500, error));
  }
};

const stockUpdateWhenOrderConfirmedd = async (req, res, next) => {
  const t = req.t;
  try {
    const { orderList = [] } = req.body;
    let items = [];
    if (req?.status !== "rejected" || req?.status !== "cancel") {
      for (const element of orderList) {
        let purchasePrice = 0;
        let quantity =
          parseFloat(element.quantity) + parseFloat(element.free_quantity);
        let product_id = element.Product.product_id;
        let unit = element.unit.toLowerCase();
        let stockBatches = await Stock.findAll({
          where: {
            product_id,
            [Op.or]: [
              { current_stock: { [Op.gt]: 0 } },
              { loose_quantity: { [Op.gt]: 0 } },
            ],
          },
          order: [["createdAt", "ASC"]],
          transaction: t,
        });

        if (!stockBatches || stockBatches.length === 0) {
          await t.rollback();
          return next(globalError(404, "Stock not found"));
        }

        for (let batch of stockBatches) {
          if (quantity <= 0) break;

          let availableQuantity = parseFloat(batch.current_stock);
          let looseQuantity = parseFloat(batch.loose_quantity);
          const conversionRate = parseFloat(
            element.Product.product_conversion_rate
          );

          if (element.Product.product_base_unit.toLowerCase() === unit) {
            if (availableQuantity >= quantity) {
              availableQuantity -= quantity;
              quantity = 0;
            } else {
              quantity -= availableQuantity;
              availableQuantity = 0;
            }

            await Stock.update(
              {
                current_stock: availableQuantity,
              },
              { where: { stock_id: batch.stock_id }, transaction: t }
            );
          } else {
            if (looseQuantity > 0) {
              if (quantity <= looseQuantity) {
                looseQuantity -= quantity;
                quantity = 0;
              } else {
                quantity -= looseQuantity;
                looseQuantity = 0;
              }

              await Stock.update(
                {
                  loose_quantity: looseQuantity,
                },
                { where: { stock_id: batch.stock_id }, transaction: t }
              );
            }

            if (
              quantity > 0 &&
              quantity < conversionRate &&
              availableQuantity > 0
            ) {
              availableQuantity -= 1;
              looseQuantity += conversionRate;

              await Stock.update(
                {
                  current_stock: availableQuantity,
                  loose_quantity: looseQuantity,
                },
                { where: { stock_id: batch.stock_id }, transaction: t }
              );
            }

            if (quantity > 0 && looseQuantity > 0) {
              if (quantity <= looseQuantity) {
                looseQuantity -= quantity;
                quantity = 0;
              } else {
                quantity -= looseQuantity;
                looseQuantity = 0;
              }

              await Stock.update(
                {
                  loose_quantity: looseQuantity,
                  s,
                },
                { where: { stock_id: batch.stock_id }, transaction: t }
              );
            }

            if (quantity > 0 && availableQuantity > 0) {
              let unitsToDeduct = Math.floor(quantity / conversionRate);
              let remainingLoose = quantity % conversionRate;

              if (unitsToDeduct > availableQuantity) {
                unitsToDeduct = availableQuantity;
                remainingLoose = 0;
              }

              availableQuantity -= unitsToDeduct;
              quantity -= unitsToDeduct * conversionRate;

              if (quantity > 0 && remainingLoose > 0) {
                if (remainingLoose <= looseQuantity) {
                  looseQuantity -= remainingLoose;
                  quantity = 0;
                } else {
                  quantity -= looseQuantity;
                  looseQuantity = 0;
                }
              }

              await Stock.update(
                {
                  current_stock: availableQuantity,
                  loose_quantity: looseQuantity,
                },
                { where: { stock_id: batch.stock_id }, transaction: t }
              );
            }
          }

          // if (availableQuantity === 0 && looseQuantity === 0) {
          //   await Stock.destroy({ where: { id: batch.id }, transaction: t });
          // }
          purchasePrice = parseFloat(batch.purchase_price);
        }
        items.push({
          product_id: product_id,
          purchase_price: purchasePrice,
          conversionRate: element.Product.product_conversion_rate,
          units:
            element.Product.product_base_unit.toLowerCase() === unit
              ? true
              : false,
        });
        purchasePrice = 0;
        if (quantity > 0) {
          await t.rollback();
          return next(globalError(400, "Can't Confirm Stock Not Available"));
        }
      }
      req.items = items;
    }

    req.t = t;
    return next();
  } catch (error) {
    await t.rollback();
    next(globalError(500, error.message));
  }
};

const stockUpdateWhenPurchaseOrderRegister = async (req, res, next) => {
  const t = req.t;
  try {
    const { purchaseOrderList = [] } = req.body;
    if (req?.status !== "rejected") {
      for (const element of purchaseOrderList) {
        let quantity = parseFloat(element.quantity);
        let unit = element.unit.toLowerCase();

        if (element.Product.product_base_unit.toLowerCase() === unit) {
          const createdStock = await Stock.create(
            {
              current_stock: quantity,
              loose_quantity: 0,
              product_id: element.Product.product_id,
              minimum_stock: quantity / 2,
              purchase_price: parseFloat(element.price),
              expiry_date: element.expiry_date,
            },
            { transaction: t }
          );

          if (!createdStock) {
            await t.rollback();
            return next(globalError(404, "Stock not Created"));
          }
        } else {
          const conversionRate = parseFloat(
            element.Product.product_conversion_rate
          );

          const fullUnits = Math.floor(quantity / conversionRate);
          const remainingLoose = quantity % conversionRate;

          const createdStock = await Stock.create(
            {
              current_stock: fullUnits,
              loose_quantity: remainingLoose,
              product_id: element.Product.product_id,
              minimum_stock: fullUnits / 2,
              purchase_price: parseFloat(element.price),
              expiry_date: element.expiry_date,
            },
            { transaction: t }
          );

          if (!createdStock) {
            await t.rollback();
            return next(globalError(404, "Stock not Created"));
          }
        }
      }
    }
    req.t = t;
    return next();
  } catch (error) {
    await t.rollback();
    next(globalError(500, error));
  }
};

const stockUpdateWhenReturnOrderRegister = async (req, res, next) => {
  const t = req.t;
  try {
    const { returnOrderList = [] } = req.body;
    let items = [];
    if (req?.status === "rejected") {
      return next();
    }
    for (const element of returnOrderList) {
      let quantity = parseFloat(element.quantity);
      let unit = element.unit.toLowerCase();
      let stockBatches = await Stock.findAll({
        where: {
          product_id,
          expiry_date: element.expiry_date,
        },
        order: [["createdAt", "ASC"]],
        transaction: t,
      });

      if (!stockBatches || stockBatches.length === 0) {
        await t.rollback();
        return next(globalError(404, "Stock not found"));
      }

      for (let batch of stockBatches) {
        if (quantity <= 0) break;

        let availableQuantity = parseFloat(batch.current_stock);
        let looseQuantity = parseFloat(batch.loose_quantity);
        const conversionRate = parseFloat(
          element.Product.product_conversion_rate
        );

        if (element.Product.product_base_unit.toLowerCase() === unit) {
          availableQuantity += quantity;

          await Stock.update(
            {
              current_stock: availableQuantity,
            },
            { where: { stock_id: batch.stock_id }, transaction: t }
          );
        } else {
          looseQuantity += quantity;

          let Loose_In_Base_Unit = Math.floor(looseQuantity / conversionRate);
          let remainingLoose = looseQuantity % conversionRate;

          availableQuantity += Loose_In_Base_Unit;
          looseQuantity = remainingLoose;

          await Stock.update(
            {
              current_stock: availableQuantity,
              loose_quantity: looseQuantity,
            },
            { where: { stock_id: batch.stock_id }, transaction: t }
          );
        }
      }
    }

    req.t = t;
    return next();
  } catch (error) {
    await t.rollback();
    next(globalError(500, error));
  }
};

module.exports = {
  updateStockDetailsByStockId,
  stockUpdateWhenOrderConfirmed,
  stockUpdateWhenPurchaseOrderRegister,
  stockUpdateWhenOrderConfirmedd,
  stockUpdateWhenReturnOrderRegister,
};
