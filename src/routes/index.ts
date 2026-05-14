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
import { NotificationRoutes } from "../app/modules/notification/notification.route";
import { HeatmapsRoutes } from "../app/modules/heatmaps/heatmaps.route";
import { PlanRoutes } from "../app/modules/subscriptions/plan/plan.route";
import { CouponRoutes } from "../app/modules/subscriptions/coupon/coupon.route";
import { GlobalRoutes } from "../app/modules/globals/global.route";
import { SubscriptionRoutes } from "../app/modules/subscriptions/subscription/subscription.route";
import { RigAdminRoutes } from "../app/modules/rigAdmin/rigAdmin.route";
import { MessageRoutes } from "../app/modules/contentManagement/messages/messages.route";
import { ClientRoutes } from "../app/modules/client/client.route";

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
    path: "/client",
    route: ClientRoutes,
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
    path: "/rig-admin",
    route: RigAdminRoutes,
  },

  //--------------- Card Submission start -------------
  {
    path: "/card-submission",
    route: CardSubmissionRoutes,
  },
  //--------------- Card Submission end ---------------

  //--------------- Daily Debrief Submission start -------------
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
  //--------------- Daily Debrief Submission end -------------

  //--------------- Content Management start -------------
  {
    path: "/video",
    route: VideosRoutes,
  },
  {
    path: "/message",
    route: MessageRoutes,
  },
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
  //--------------- Content Management end -------------

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
  {
    path: "/notification",
    route: NotificationRoutes,
  },

  // heatmap
  {
    path: "/heatmap",
    route: HeatmapsRoutes,
  },

  //--------------- Subscription start -------------
  {
    path: "/plan",
    route: PlanRoutes,
  },
  {
    path: "/coupon",
    route: CouponRoutes,
  },
  {
    path: "/subscription",
    route: SubscriptionRoutes,
  },
  //--------------- Subscription end -------------

  //--------------- Global start -------------
  {
    path: "/global",
    route: GlobalRoutes,
  },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
