import { Request, Response, NextFunction } from "express";

function clientErrorStatus(err: unknown): number | null {
  const status = (err as { status?: unknown })?.status;
  return typeof status === "number" && status >= 400 && status < 500 ? status : null;
}

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const clientStatus = clientErrorStatus(err);
  if (clientStatus) {
    res.status(clientStatus).json({ error: "The request could not be understood." });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
