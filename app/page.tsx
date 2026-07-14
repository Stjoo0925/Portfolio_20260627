import { GalaxyIntro } from "@/components/interface/galaxy-intro";
import { loadHero, loadSite } from "@/lib/content/load";

export default function Home() {
  const hero = loadHero();
  const site = loadSite();

  return <GalaxyIntro name={site.name} hero={hero} />;
}
