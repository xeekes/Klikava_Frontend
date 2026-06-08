import { USER_ROLES } from "../constants/roles";

export const scopeBySeller = (items, user) => {
  if (!user || user.role === USER_ROLES.ADMIN) {
    return items;
  }

  return items.filter((item) => item.sellerId === user.sellerId);
};
