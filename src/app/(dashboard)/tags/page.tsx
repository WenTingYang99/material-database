import { TagsManager } from "@/components/tags/TagsManager";
import { createRepositories } from "@/lib/db/repositories/factory";

export default async function TagsPage() {
  const { tags } = createRepositories();
  const rows = await tags.findAll();
  return (
    <main>
      <TagsManager rows={rows} />
    </main>
  );
}
