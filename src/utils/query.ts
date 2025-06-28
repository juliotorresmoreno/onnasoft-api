import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsObject,
  ValidateNested,
  IsString,
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
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
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
  relations?: Record<string, boolean>;

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

  @IsOptional()
  @IsString()
  @ValidateNested()
  @Type(() => String)
  locale?: string;

  @IsOptional()
  @IsNumber()
  @ValidateNested()
  @Type(() => Number)
  page?: number;
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

function handleWhereKey(key: string, value: any, where: Record<string, any>) {
  const regex = /where\[(\w+)\](?:\[(\w+)\])?/;
  const path = regex.exec(key);
  if (!path) return;

  const [, field, op] = path;
  const raw = value;
  const inferredValue = inferValue(raw);

  if (op && operatorMap[op]) {
    where[field] = operatorMap[op](raw);
  } else {
    where[field] = inferredValue;
  }
}

function handleSelectKey(
  key: string,
  value: any,
  options: FindManyOptions<any>,
) {
  const field = key.slice(7, -1);
  if (!Array.isArray(options.select)) {
    options.select = ['id', 'created_at', 'updated_at'];
  }
  if (value === 'true' && Array.isArray(options.select)) {
    options.select.push(field);
  }
}

export function buildFindManyOptions<T>(
  query: Record<string, any>,
): FindManyOptions<T> {
  const options: FindManyOptions<T> = {};
  const where: Record<string, any> = {};

  Object.keys(query).forEach((key) => {
    if (key.startsWith('where[')) {
      handleWhereKey(key, query[key], where);
    } else if (key.startsWith('select[')) {
      handleSelectKey(key, query[key], options);
    }
  });

  if (options.select) {
    handleSelectKey('id', true, options);
  }

  if (query.order) {
    options.order = query.order;
  }

  options.relations = [];
  if (query.relations) {
    const relations: string[] = Array.from(
      new Set(query.relations.split(',').map((r: string) => r.trim())),
    );
    options.relations = relations;
  }
  options.relations = options.relations ?? [];
  const relations = options.relations as string[];
  const locale = query.locale;
  if (locale) {
    relations.push('translations');
    where.translations = { locale };
  }

  if (Object.keys(where).length > 0) {
    options.where = where;
  }

  if (query.skip !== undefined) {
    options.skip = Number(query.skip);
  }

  options.take =
    (query.limit ?? query.take !== undefined)
      ? Number(query.limit ?? query.take)
      : 10;

  if (query.page !== undefined) {
    options.skip = (Number(query.page) - 1) * options.take;
  }

  return options;
}
