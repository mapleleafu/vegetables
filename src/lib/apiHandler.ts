import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiError, ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { UserRole } from "@/types/user";

type RouteHandlerContext = {
  params: Promise<Record<string, string>>;
};

type ResolvedContext = {
  params: Record<string, string>;
};

type AuthorizedHandler = (req: Request, context: ResolvedContext, user: { id: string; role: UserRole }) => Promise<NextResponse | any>;

type PublicHandler = (req: Request, context: ResolvedContext) => Promise<NextResponse | any>;

interface Options {
  requiredRole?: UserRole;
  isPublic?: boolean;
}

export function apiHandler(handler: AuthorizedHandler | PublicHandler, options: Options = {}) {
  return async (req: Request, context: RouteHandlerContext) => {
    try {
      const resolvedParams = await context.params;
      const cleanContext: ResolvedContext = { params: resolvedParams };

      if (!options.isPublic) {
        const session = await getServerSession(authOptions);

        if (!session?.user || !(session.user as any).id) {
          throw new UnauthorizedError();
        }

        const user = session.user as { id: string; role: UserRole };

        if (options.requiredRole && user.role !== options.requiredRole) {
          throw new ForbiddenError("Insufficient permissions");
        }

        return await (handler as AuthorizedHandler)(req, cleanContext, user);
      }

      return await (handler as PublicHandler)(req, cleanContext);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
      }

      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return NextResponse.json({ error: "A record with this value already exists." }, { status: 409 });
        }
      }

      console.error(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
