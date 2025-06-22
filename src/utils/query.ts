import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsObject,
  ValidateNested,
  IsArray,
} from 'class-validator';
import {
  FindManyOptions,
  FindOptionsWhere,
  FindOptionsOrder,
  FindOperator,
  MoreThanOrEqual,
  LessThanOrEqual,
  MoreThan,
  LessThan,
  Like,
  ILike,
  Not,
  In,
  Between,
  FindOptionsSelect,
} from 'typeorm';

export class QueryParams<T> {
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => String)
  select?: FindOptionsSelect<T>;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  where?: FindOptionsWhere<T>;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  order?: FindOptionsOrder<T>;

  @IsOptional()
  @IsNumber()
  @ValidateNested()
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsNumber()
  @ValidateNested()
  @Type(() => Number)
  take?: number;
}

const operatorMap: Record<string, (val: any) => FindOperator<any>> = {
  gte: (val) => MoreThanOrEqual(val),
  lte: (val) => LessThanOrEqual(val),
  gt: (val) => MoreThan(val),
  lt: (val) => LessThan(val),
  like: (val) => Like(`%${val}%`),
  ilike: (val) => ILike(`%${val}%`),
  not: (val) => Not(val),
  in: (val) => In(val.split(',')),
  notIn: (val) => Not(In(val.split(','))),
  between: (val) => {
    const [start, end] = val.split(',');
    return Between(inferValue(start), inferValue(end));
  },
};

const inferValue = (value: string): any => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!isNaN(Number(value))) return Number(value);
  const date = new Date(value);
  if (!isNaN(date.getTime())) return date;
  return value;
};

export function buildFindManyOptions<T>(
  query: Record<string, any>,
): FindManyOptions<T> {
  const options: FindManyOptions<T> = {};
  const where: Record<string, any> = {};

  for (const key in query) {
    if (key.startsWith('where[')) {
      const regex = /where\[(\w+)\](?:\[(\w+)\])?/;
      const path = regex.exec(key);
      if (!path) continue;

      const [, field, op] = path;
      const raw = query[key];
      const value = inferValue(raw);

      if (op && operatorMap[op]) {
        where[field] = operatorMap[op](raw);
      } else {
        where[field] = value;
      }
    } else if (key.startsWith('select[')) {
      const field = key.slice(7, -1); // Remove 'select[' and ']'
      if (!options.select) {
        options.select = {};
      }
      if (query[key] === 'true') {
        options.select[field] = true;
      }
    }
  }

  if (Object.keys(where).length > 0) {
    options.where = where;
  }

  if (query.order) {
    options.order = query.order;
  }

  if (query.skip !== undefined) {
    options.skip = Number(query.skip);
  }

  options.take = query.take !== undefined ? Number(query.take) : 10;

  return options;
}
