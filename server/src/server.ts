app.get("*", (_req: Request, res: Response) => {
  try {
    const indexPath = path.join(clientPath, "index.html");
    res.sendFile(indexPath);
  } catch (error) {
    console.error("Error serving index.html:", error);
    res.status(500).send({
      error: "An error occurred while serving the React application",
      details: error.message,
    });
  }
});
