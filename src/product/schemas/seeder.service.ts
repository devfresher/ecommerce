import { Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from 'src/product/schemas/product.schema';
import { UserService } from 'src/user/services/user.service';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    private readonly userService: UserService,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async onModuleInit() {
    await this.seedProducts();
  }

  /**
   * Seeds demo products into the database if the demo user exists.
   * The products are created with the following data:
   * - Product 1: name: "Product 1", description: "Product 1 description", price: 100, quantity: 10
   * - Product 2: name: "Product 2", description: "Product 2 description", price: 200, quantity: 20
   * - Product 3: name: "Product 3", description: "Product 3 description", price: 300, quantity: 30
   *
   * If the demo user does not exist, this function does nothing.
   *
   * @private
   */
  private async seedProducts() {
    const userEmail = 'demo-user@example.com';
    const userExists = await this.userService.get({ filter: { email: userEmail } });

    if (userExists) {
      const productData = [
        {
          name: 'Product 1',
          description: 'Product 1 description',
          price: 100,
          quantity: 10,
        },
        {
          name: 'Product 2',
          description: 'Product 2 description',
          price: 200,
          quantity: 20,
        },
        {
          name: 'Product 3',
          description: 'Product 3 description',
          price: 300,
          quantity: 30,
        },
      ];

      const bulkOps = productData.map((product) => ({
        updateOne: {
          filter: { name: product.name },
          update: { $set: product },
          upsert: true,
        },
      }));

      await this.productModel.bulkWrite(bulkOps);
    }
  }
}
