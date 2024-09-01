import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/modules/product/schemas/product.schema';
import { ProductService } from './services/product.service';
import { SeederService } from './schemas/seeder.service';
import { UserModule } from '../user/user.module';
import { ProductController } from './product.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]), UserModule],
  providers: [ProductService, SeederService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
