export default cachedEventHandler(
  (event) => sendRedirect(event, "https://youtu.be/dQw4w9WgXcQ"),
  {
    maxAge: 604_800, // 7 days lol
  }
);
