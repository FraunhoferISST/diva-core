import apiFactory from "@/api/apiFactory";
const entityTypes = [
  "resource",
  "asset",
  "user",
  "publisher",
  "review",
  "service",
  "folder",
  "destroyclaim",
];
export default {
  ...Object.fromEntries(
    entityTypes.map((type) => [`${type}s`, apiFactory(`/${type}s`)])
  ),
};
