import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApprovalStatus } from './product.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  readonly name!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  readonly price!: number;

  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  readonly quantity!: number;
}

export class UpdateProductDto extends CreateProductDto {}

export class UpdateStatusDto {
  @IsString()
  @IsNotEmpty()
  readonly status!: ApprovalStatus;

  @IsString()
  readonly reason!: string;
}
