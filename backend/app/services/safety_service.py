unsafe_conditions = {"spoiled", "contaminated"}


def evaluate_safety(condition: str, safety_notes: list[str]) -> tuple[str, list[str]]:
    notes = list(safety_notes)

    if condition in unsafe_conditions:
        notes.append("User marked leftovers as spoiled or contaminated.")
        return "not_safe_for_edible_reuse", notes

    if safety_notes:
        return "needs_user_review", notes

    if condition == "unknown":
        notes.append("Condition is unknown. Ask the user to confirm freshness and storage.")
        return "needs_user_review", notes

    return "eligible_with_freshness_check", notes
