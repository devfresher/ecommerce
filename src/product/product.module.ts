import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/product/schemas/product.schema';
import { ProductService } from './services/product.service';
import { SeederService } from './services/seeder.service';
import { UserModule } from 'src/user/user.module';
import { ProductController } from './product.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]), UserModule],
  providers: [ProductService, SeederService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
