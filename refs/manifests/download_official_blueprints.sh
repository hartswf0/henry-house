#!/usr/bin/env bash
set -euo pipefail
mkdir -p official_blueprints
cd official_blueprints

echo "These are official Rural Studio / Front Porch download URLs. Review the source pages and their download terms before use."

curl -L --fail -o Dave_Floorplan.pdf 'https://frontporch.ruralstudio.org/wp-content/uploads/2023/06/20Kv08_Dave_Floorplan_MF.pdf' || true
curl -L --fail -o MacArthur_Floorplan.pdf 'https://frontporch.ruralstudio.org/wp-content/uploads/2023/06/20Kv09_Mac_Floorplan_MF.pdf' || true
curl -L --fail -o Joanne_Floorplan.pdf 'https://frontporch.ruralstudio.org/wp-content/uploads/2023/06/20Kv10_Joanne_Floorplan_MF.pdf' || true
curl -L --fail -o Sylvia_2_1_Floorplan.pdf 'https://frontporch.ruralstudio.org/wp-content/uploads/2023/06/Sylvia-2-1_Floorplan.pdf' || true
curl -L --fail -o Sylvia_2_2_Floorplan.pdf 'https://frontporch.ruralstudio.org/wp-content/uploads/2024/03/Sylvia-2-2_Floorplan.pdf' || true
curl -L --fail -o Sylvia_3_2_Floorplan.pdf 'https://frontporch.ruralstudio.org/wp-content/uploads/2024/03/Sylvia-3-2_Floorplan.pdf' || true

echo "Done. If a URL is blocked, open 00_BLUEPRINT_FIRST_WALL.html and use the official download button there."
