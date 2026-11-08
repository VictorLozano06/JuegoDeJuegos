// Historial y costes de diseño para el árbol tecnológico del juego.
// Año, RP y deuda son valores de simulación, no fechas de invención exactas.
// id, nombre, categoría, año, RP, deuda, prerrequisitos
const rows = [
 ['tech_graphics_text_ascii','Modo Texto & ASCII','Graphics',1982,0,0,[]],
 ['tech_graphics_2d_sprites','Sprites 2D por Hardware','Graphics',1983,15,2,['tech_graphics_text_ascii']],
 ['tech_graphics_fixed_palette','Paleta de Color Fija (16c)','Graphics',1983,10,1,[]],
 ['tech_graphics_parallax_scroll','Scroll Parallax Básico','Graphics',1986,25,4,['tech_graphics_2d_sprites']],
 ['tech_audio_pc_speaker','PC Speaker / Beeper 1-bit','Audio',1982,0,0,[]],
 ['tech_audio_chiptune_fm','Síntesis Chiptune FM (PSG/SID)','Audio',1984,20,3,['tech_audio_pc_speaker']],
 ['tech_code_pure_asm','Código en Ensamblador Puro','Engine',1982,0,8,[]],
 ['tech_code_real_mode_mem','Gestión de Memoria en Modo Real','Engine',1983,15,6,['tech_code_pure_asm']],
 ['tech_gameplay_aabb_collision','Colisiones Básicas (AABB)','Physics',1982,10,2,[]],
 ['tech_ai_rigid_patrol','Patrulla Reactiva Rígida','AI',1983,15,2,[]],
 ['tech_graphics_mode7','Modo 7 & Escalado 2D','Graphics',1990,35,5,['tech_graphics_parallax_scroll']],
 ['tech_graphics_raycasting_pseudo3d','Pseudo-3D / Raycasting','Graphics',1992,45,7,['tech_graphics_mode7']],
 ['tech_graphics_early_3d_polygons','3D Poligonal (Flat Shading)','Graphics',1993,55,9,['tech_graphics_raycasting_pseudo3d']],
 ['tech_graphics_gouraud_textures','Mapeado de Texturas & Gouraud','Graphics',1995,65,8,['tech_graphics_early_3d_polygons']],
 ['tech_graphics_hardware_accel','Aceleración 3D (3dfx / Glide / OpenGL)','Graphics',1996,80,6,['tech_graphics_gouraud_textures']],
 ['tech_audio_midi','Audio MIDI General','Audio',1990,30,3,['tech_audio_chiptune_fm']],
 ['tech_audio_sampled_wav_mod','Audio Muestreado (MOD / WAV)','Audio',1993,40,4,['tech_audio_midi']],
 ['tech_audio_cd_redbook','Pistas CD-ROM (Red Book Audio)','Audio',1994,50,3,['tech_audio_sampled_wav_mod']],
 ['tech_code_c_cpp_migration','Arquitectura C / C++','Engine',1991,40,3,['tech_code_pure_asm']],
 ['tech_code_cdrom_storage','Soporte Formato CD-ROM (650MB)','Engine',1993,50,4,['tech_code_c_cpp_migration']],
 ['tech_code_early_multimedia_api','APIs Multimedia (Win32 / DirectX)','Engine',1995,60,5,['tech_code_c_cpp_migration']],
 ['tech_gameplay_fmv_cinematics','Cinemáticas FMV (Vídeo Comprimido)','Engine',1994,45,6,['tech_code_cdrom_storage']],
 ['tech_gameplay_sram_memcards','Guardado en Pila SRAM / Memory Cards','Engine',1991,25,2,[]],
 ['tech_ai_astar_pathfinding','Pathfinding A* & Waypoints','AI',1996,55,5,['tech_ai_rigid_patrol']],
 ['tech_graphics_hardware_tl','Hardware Transform & Lighting (T&L)','Graphics',2000,85,6,['tech_graphics_hardware_accel']],
 ['tech_graphics_programmable_shaders','Shaders Programables (Pixel/Vertex)','Graphics',2002,100,9,['tech_graphics_hardware_tl']],
 ['tech_graphics_normal_mapping','Normal Mapping & Relieve Dinámico','Graphics',2004,110,7,['tech_graphics_programmable_shaders']],
 ['tech_graphics_early_hdr_bloom','Post-procesado (Bloom & HDR Temprano)','Graphics',2006,120,8,['tech_graphics_normal_mapping']],
 ['tech_physics_ragdoll','Física Rígida & Ragdoll','Physics',2001,80,7,['tech_gameplay_aabb_collision']],
 ['tech_physics_vehicle_ballistics','Balística Simple & Dinámica de Vehículos','Physics',2004,95,8,['tech_physics_ragdoll']],
 ['tech_audio_surround_3d','Audio 3D Posicional / EAX Surround 5.1','Audio',2001,75,4,['tech_audio_cd_redbook']],
 ['tech_audio_full_voiceover','Doblaje de Voz Completo','Audio',2003,90,5,['tech_audio_surround_3d']],
 ['tech_net_lan_ipx','Conexión Local LAN / IPX','Network',2000,70,6,[]],
 ['tech_net_dedicated_client_server','Arquitectura Cliente-Servidor Dedicado','Network',2003,110,10,['tech_net_lan_ipx']],
 ['tech_net_matchmaking_leaderboards','Matchmaking Centralizado & Marcadores','Network',2006,125,8,['tech_net_dedicated_client_server']],
 ['tech_graphics_deferred_shading','Renderizado Diferido (Deferred Shading)','Graphics',2010,140,10,['tech_graphics_early_hdr_bloom']],
 ['tech_graphics_pbr','Renderizado Físico (PBR Materiales)','Graphics',2013,160,11,['tech_graphics_deferred_shading']],
 ['tech_graphics_taa_antialiasing','Antialiasing Temporal (TAA)','Graphics',2015,150,7,['tech_graphics_pbr']],
 ['tech_physics_partial_destruction','Destrucción Parcial de Entornos','Physics',2011,135,11,['tech_physics_vehicle_ballistics']],
 ['tech_physics_cloth_fluids','Simulación de Ropa y Fluidos en Vivo','Physics',2014,155,12,['tech_physics_partial_destruction']],
 ['tech_ai_behavior_trees','Árboles de Comportamiento (Behavior Trees)','AI',2011,120,8,['tech_ai_astar_pathfinding']],
 ['tech_net_cloud_virtualization','Arquitectura Servidores en la Nube','Network',2012,160,12,['tech_net_matchmaking_leaderboards']],
 ['tech_services_cloud_saves','Sincronización de Partidas Cloud','Network',2013,110,5,['tech_net_cloud_virtualization']],
 ['tech_services_workshop_modding','API de Modding & Soporte Workshop','Engine',2012,140,9,['tech_code_early_multimedia_api']],
 ['tech_graphics_ray_tracing','Trazado de Rayos Hardware (Ray Tracing)','Graphics',2019,220,15,['tech_graphics_pbr']],
 ['tech_graphics_dlss_upscaling','Escalado Temporal por I.A. (DLSS / FSR)','Graphics',2020,200,12,['tech_graphics_taa_antialiasing']],
 ['tech_graphics_path_tracing','Path Tracing Completo en Tiempo Real','Graphics',2023,280,18,['tech_graphics_ray_tracing']],
 ['tech_graphics_virtual_micropolygon','Geometría Virtualizada / Micropolígonos','Graphics',2022,250,16,['tech_graphics_pbr']],
 ['tech_physics_full_destruction','Física Destructible Total del Escenario','Physics',2021,230,17,['tech_physics_partial_destruction']],
 ['tech_ai_procedural_generation','Generación Procedural Masiva de Mundos','AI',2019,190,13,['tech_ai_behavior_trees']],
 ['tech_ai_llm_reactive_npcs','Lógica de NPCs con LLM / Diálogo Dinámico','AI',2024,270,20,['tech_ai_procedural_generation']],
 ['tech_net_rollback_netcode','Rollback Netcode Predictivo','Network',2019,210,14,['tech_net_dedicated_client_server']],
 ['tech_net_massive_spatial_sharding','Instancias Masivas para Battle Royale/MMO','Network',2020,240,16,['tech_net_cloud_virtualization']],
 ['tech_net_crossplay_ecosystem','Ecosistema Cross-Play & Cross-Progression','Network',2020,180,10,['tech_services_cloud_saves']]
];

// Separate category bands and stack simultaneous nodes in depth. Edges still need
// routing/visual inspection; three-dimensional layout cannot guarantee no crossings.
const categoryIndex = { Graphics:0, Audio:1, Engine:2, Physics:3, AI:4, Network:5 };
const slots = new Map();
export const TECH_TREE_NODES = rows.map(([id,name,category,eraYear,researchCost,baseDebt,requiredNodes]) => {
 const key = `${eraYear}:${category}`;
 const slot = slots.get(key) || 0;
 slots.set(key, slot + 1);
 return { id,name,category,eraYear,researchCost,baseDebt,requiredNodes,
  position:{ x:(eraYear - 1982) * 3, y:(2.5 - categoryIndex[category]) * 8, z:slot * 5 } };
});
const byId = new Map(TECH_TREE_NODES.map(node => [node.id, node]));

/** Compare selected technology years; unrecognized IDs are ignored. */
export function calculateTechIncompatibility(selectedNodes = []) {
 const nodes = Array.from(selectedNodes, item => typeof item === 'string' ? byId.get(item) : item).filter(node => node && Number.isFinite(node.eraYear));
 if (nodes.length < 2) return { gapYears:0, multiplier:1, incompatible:false };
 const years = nodes.map(node => node.eraYear);
 const gapYears = Math.max(...years) - Math.min(...years);
 return { gapYears, multiplier:gapYears > 12 ? 1 + (gapYears - 12) * 0.08 : 1, incompatible:gapYears > 12 };
}
export default TECH_TREE_NODES;
