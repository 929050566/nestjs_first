import { error } from "console";
import isNil from "lodash"

/**
 * 用户请求验证中的Boolean数据转义
 * @param value 
 * @returns 
 */
export function toBoolean(value?: string | boolean): boolean {
  if (isNil(value)) return false;
  if (typeof value === 'boolean') return value;
  try{
    return JSON.parse(value.toLocaleLowerCase());
  } catch(error){
    return value as unknown as boolean;
  }
}

/**
 * 用于请求验证数据中的null
 * @param value 
 * @returns 
 */
export function toNull(value?: string | null): string | null | undefined{
  return value === "null" ? null : value;
}

