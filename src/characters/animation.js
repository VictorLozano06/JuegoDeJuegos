const poses = new WeakMap();

/** Record the rig's seated rest pose once, before the first frame. */
export function initializeEmployeeAnimation(character) {
    const { torso, head, arms, index } = character;
    poses.set(character, {
        torsoPitch: torso.rotation.x,
        torsoHeight: torso.position.y,
        headPitch: head.rotation.x,
        headYaw: head.rotation.y,
        headRoll: head.rotation.z,
        arms: arms.map(({ shoulder, elbow, wrist }) => ({
            shoulderPitch: shoulder.rotation.x,
            shoulderRoll: shoulder.rotation.z,
            elbowPitch: elbow.rotation.x,
            wristPitch: wrist.rotation.x,
        })),
        phase: index * 1.61,
        lastTime: null,
        thinking: 0,
        celebrating: 0,
        glance: 0,
    });
}

/** Apply absolute offsets from the rest pose so the seated rig cannot drift. */
export function animateEmployee(character, timeSeconds, glance = 0) {
    const pose = poses.get(character);
    const { torso, head, arms, state } = character;
    const elapsed = pose.lastTime === null ? 1 / 60 : timeSeconds - pose.lastTime;
    pose.lastTime = timeSeconds;

    // Blend state changes without letting a background-tab pause snap the pose.
    const blend = 1 - Math.exp(-9 * Math.min(Math.max(elapsed, 0), 0.05));
    pose.thinking += (Number(state === 'thinking') - pose.thinking) * blend;
    pose.celebrating += (Number(state === 'celebrating') - pose.celebrating) * blend;
    pose.glance += (glance - pose.glance) * blend;

    const { phase, thinking, celebrating } = pose;
    const typing = Math.max(0, 1 - thinking - celebrating);
    const breath = 0.5 + 0.5 * Math.sin(timeSeconds * 2.15 + phase);
    const lean = (-0.021 - breath * 0.008) * (1 - celebrating);
    torso.rotation.x = pose.torsoPitch + lean + 0.047 * celebrating;
    torso.position.y = pose.torsoHeight + breath * 0.005;
    head.rotation.x = pose.headPitch - 0.042 * typing + 0.06 * thinking
        + (Math.sin(timeSeconds * 2.8 + phase) * 0.025) - 0.055 * celebrating;
    head.rotation.y = pose.headYaw + pose.glance;
    head.rotation.z = pose.headRoll + 0.09 * thinking;

    for (let i = 0; i < arms.length; i++) {
        const { shoulder, elbow, wrist } = arms[i];
        const rest = pose.arms[i];
        const side = i === 0 ? -1 : 1;
        // Opposite phase lets one hand descend as the other lifts. Lift the
        // fingers from the keyboard instead of driving the hand through it.
        const tap = 0.5 + 0.5 * Math.sin(timeSeconds * 13 + phase + i * Math.PI);
        const cheer = Math.sin(timeSeconds * 9 + phase + i * 1.5);
        const shoulderLift = (0.014 + 0.012 * tap) * typing
            + (0.96 + 0.09 * cheer) * celebrating + 0.042 * thinking;
        const elbowLift = 0.026 * tap * typing - 0.11 * celebrating;

        shoulder.rotation.x = rest.shoulderPitch + shoulderLift;
        shoulder.rotation.z = rest.shoulderRoll + side * 0.39 * celebrating;
        elbow.rotation.x = rest.elbowPitch + elbowLift;
        wrist.rotation.x = rest.wristPitch - shoulderLift - elbowLift - lean
            - 0.025 * (1 - tap) * typing + 0.7 * celebrating;
    }
}
