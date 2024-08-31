import { IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength, maxLength, Min } from 'class-validator';
import { ApprovalStatus } from './product.enum';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  readonly name!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Price is required' })
  @Min(0, { message: 'Price should be greater than 0' })
  readonly price!: number;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  readonly description!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Quantity is required' })
  @Min(0)
  readonly quantity!: number;
}

export class UpdateProductDto extends CreateProductDto {}

export class UpdateStatusDto {
  @IsEnum([ApprovalStatus.Approved, ApprovalStatus.Rejected], {
    message: `Invalid approval status, should be one of Approved, Rejected`,
  })
  @IsNotEmpty({ message: 'Approval status is required' })
  readonly status!: ApprovalStatus.Approved | ApprovalStatus.Rejected;

  @IsString()
  @MaxLength(255, { message: 'Reason should be less than 255 characters' })
  readonly reason?: string;
}
