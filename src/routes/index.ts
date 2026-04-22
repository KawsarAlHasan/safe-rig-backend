import express from "express";
import { UserRoutes } from "../app/modules/user/user.route";
import { AdminRoutes } from "../app/modules/admin/admin.route";
import { AdminRoleRoutes } from "../app/modules/adminRole/role.route";
import { CompanyRoutes } from "../app/modules/company/company.route";
import { RigTypeRoutes } from "../app/modules/contentManagement/rigType/rigType.route";
import { ClientAuthRoutes } from "../app/modules/auth/client/clientAuth.route";
import { RigRoutes } from "../app/modules/rig/rig.route";
import { UserAuthRoutes } from "../app/modules/auth/user/userAuth.route";
import { VideosRoutes } from "../app/modules/contentManagement/videos/videos.route";
import { AlertRoutes } from "../app/modules/contentManagement/alert/alert.route";
import { AppRoutes } from "../app/modules/appPage/app.route";
import { HazardRoutes } from "../app/modules/contentManagement/hazard/hazard.route";
import { cardTypeRoutes } from "../app/modules/contentManagement/cardType/cardType.route";
import { AreaRoutes } from "../app/modules/contentManagement/area/area.route";
import { CardSubmissionRoutes } from "../app/modules/cardSubmission/cardSubmission.route";
import { ActivityRoutes } from "../app/modules/debriefsManagement/activity/activity.route";
import { TypeOfDevriefRoutes } from "../app/modules/debriefsManagement/typeOfDevrief/typeOfDevrief.route";
import { DailyDebriefRoutes } from "../app/modules/debriefsManagement/dailyDebrief/dailyDebrief.route";
import { AdminAuthRoutes } from "../app/modules/auth/admin/adminAuth.route";
import { QuestionRoutes } from "../app/modules/games/questionAnwser/questionAnwser.route";
import { PuzzleRoutes } from "../app/modules/games/puzzle/puzzle.route";
import { GameScheduleRoutes } from "../app/modules/games/gameSchedule/gameSchedule.route";

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
    path: "/app",
    route: AppRoutes,
  },
  {
    path: "/auth/admin",
    route: AdminAuthRoutes,
  },
  {
    path: "/auth/client",
    route: ClientAuthRoutes,
  },
  {
    path: "/auth/user",
    route: UserAuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/rig",
    route: RigRoutes,
  },
  {
    path: "/video",
    route: VideosRoutes,
  },
  // message
  {
    path: "/alert",
    route: AlertRoutes,
  },
  {
    path: "/rig-type",
    route: RigTypeRoutes,
  },
  {
    path: "/card-type",
    route: cardTypeRoutes,
  },
  {
    path: "/area",
    route: AreaRoutes,
  },
  {
    path: "/hazard",
    route: HazardRoutes,
  },
  {
    path: "/card-submission",
    route: CardSubmissionRoutes,
  },
  {
    path: "/activity",
    route: ActivityRoutes,
  },
  {
    path: "/type-of-devrief",
    route: TypeOfDevriefRoutes,
  },
  {
    path: "/daily-debrief",
    route: DailyDebriefRoutes,
  },

  // game routes
  {
    path: "/game",
    route: GameScheduleRoutes,
  },
  {
    path: "/question",
    route: QuestionRoutes,
  },
  {
    path: "/puzzle",
    route: PuzzleRoutes,
  },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
