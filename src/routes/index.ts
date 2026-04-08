import express from "express";
// import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from "../app/modules/user/user.route";
import { AdminRoutes } from "../app/modules/admin/admin.route";
import { AdminRoleRoutes } from "../app/modules/adminRole/role.route";
import { CompanyRoutes } from "../app/modules/company/company.route";
const router = express.Router();

const apiRoutes = [
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/admin-role",
    route: AdminRoleRoutes,
  },
  {
    path: "/company",
    route: CompanyRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  // {
  //   path: '/auth',
  //   route: AuthRoutes,
  // },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
