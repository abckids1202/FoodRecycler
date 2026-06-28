import { useState } from "react";
import { titleCase } from "../utils/formatters";

const labels = [
  "cooked_rice",
  "cooked_noodle",
  "stale_bread",
  "vegetable_leftover",
  "fruit_leftover",
  "egg",
  "chicken_leftover",
  "fish_leftover",
  "sauce_or_gravy",
  "mixed_leftover",
  "fresh_herb",
  "dairy_leftover",
  "rice",
  "noodle",
  "bread",
  "unknown_food_leftover",
  "plastic_contamination",
  "paper_contamination",
  "unsafe_spoilage_sign",
];

export default function EditableDetectionItem({ item, onChange }) {
  const [label, setLabel] = useState(item.label);

  return (
    <div className="rounded-lg border border-forest-900/10 bg-white p-4">
      <label className="text-sm font-semibold text-forest-900" htmlFor={`label-${item.id}`}>
        Detected label
      </label>
      <select
        id={`label-${item.id}`}
        value={label}
        onChange={(event) => {
          setLabel(event.target.value);
          onChange?.({ ...item, corrected_label: event.target.value });
        }}
        className="focus-ring mt-2 w-full rounded-lg border border-forest-900/10 bg-earth-50 px-3 py-2 text-sm"
      >
        {labels.map((option) => (
          <option key={option} value={option}>
            {titleCase(option)}
          </option>
        ))}
      </select>
    </div>
  );
}
