import { config, list } from "@keystone-6/core";
import { text, password } from "@keystone-6/core/fields";
import { allowAll } from "@keystone-6/core/access";
import express, { Request, Response } from "express";
import cors from "cors";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: "rzp_test_ChLIiyCkSS7Ju8",
  key_secret: "ARIXVs2t05XGgj7FCOnpalrS",
});

const createOrder = async (amount: number, currency: string = "INR") => {
  const options = {
    amount: amount * 100,
    currency,
    receipt: "receipt#2",
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(error);
  }
};

export default config({
  db: {
    provider: "sqlite",
    url: "file:./keystone.db",
  },
  server: {
    extendExpressApp: (app) => {
      app.use(express.json());
      app.use(cors());

      app.get("/", (req: Request, res: Response) => {
        res.send("Hello everyone");
      });

      app.post("/payment", async (req: Request, res: Response) => {
        const { amount } = req.body;

        try {
          const order = await createOrder(amount);
          res.status(201).json({
            success: true,
            order,
            amount,
          });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });
    },
  },
  lists: {
    User: list({
      access: allowAll,
      fields: {
        name: text({ validation: { isRequired: true } }),
        email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
        password: password(),
      },
    }),
  },
});
