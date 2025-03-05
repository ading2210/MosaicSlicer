# We'll delete this but if we need to reference the source deserializer, its here

import xml.etree.ElementTree as ET
import json

tree = ET.parse("pla.xml")
root = tree.getroot()

__namespaces = {
    "um": "http://www.ultimaker.com/material",
    "cura": "http://www.ultimaker.com/cura",
}

__material_properties_setting_map = {"diameter": "material_diameter"}

__material_metadata_setting_map = {
    "GUID": "material_guid",
    "material": "material_type",
    "brand": "material_brand",
}
__material_settings_setting_map = {
    "print temperature": "default_material_print_temperature",
    "heated bed temperature": "default_material_bed_temperature",
    "standby temperature": "material_standby_temperature",
    "processing temperature graph": "material_flow_temp_graph",
    "print cooling": "cool_fan_speed",
    "retraction amount": "retraction_amount",
    "retraction speed": "retraction_speed",
    "adhesion tendency": "material_adhesion_tendency",
    "surface energy": "material_surface_energy",
    "build volume temperature": "build_volume_temperature",
    "anti ooze retract position": "material_anti_ooze_retracted_position",
    "anti ooze retract speed": "material_anti_ooze_retraction_speed",
    "break preparation position": "material_break_preparation_retracted_position",
    "break preparation speed": "material_break_preparation_speed",
    "break preparation temperature": "material_break_preparation_temperature",
    "break position": "material_break_retracted_position",
    "flush purge speed": "material_flush_purge_speed",
    "flush purge length": "material_flush_purge_length",
    "end of filament purge speed": "material_end_of_filament_purge_speed",
    "end of filament purge length": "material_end_of_filament_purge_length",
    "maximum park duration": "material_maximum_park_duration",
    "no load move factor": "material_no_load_move_factor",
    "break speed": "material_break_speed",
    "break temperature": "material_break_temperature",
}

__unmapped_settings = ["hardware compatible", "hardware recommended"]

__keep_serialized_settings = {  # Settings irrelevant to Cura, but that could be present in the files so we must store them and keep them serialized.
    "relative extrusion",
    "flow sensor detection margin",
    "different material purge volume",
    "same material purge volume",
    "end of print purge volume",
    "end of filament purge volume",
    "purge anti ooze retract position",
    "purge drop retract position",
    "purge retract speed",
    "purge unretract speed",
    "purge anti ooze dwell time",
    "purge drop dwell time",
    "dwell time before break preparation move",
    "pressure release dwell time",
    "tainted print core max temperature",
    "recommend cleaning after n prints",
    "maximum heated bed temperature",
    "material bed adhesion temperature",
    "maximum heated chamber temperature",
    "shrinkage percentage",
    "move to die distance",
}


# class FormatMaps:

#     # A map from the printer-type in their native file-formats to the internal name we use.
#     PRINTER_TYPE_NAME = {
#         "fire_e": "ultimaker_method",
#         "lava_f": "ultimaker_methodx",
#         "magma_10": "ultimaker_methodxl",
#         "sketch": "ultimaker_sketch",
#         "sketch_large": "ultimaker_sketch_large",
#         "sketch_sprint": "ultimaker_sketch_sprint",
#     }

#     # A map from the extruder-name in their native file-formats to the internal name we use.
#     EXTRUDER_NAME_MAP = {
#         "mk14_hot": "1XA",
#         "mk14_hot_s": "2XA",
#         "mk14_c": "1C",
#         "mk14": "1A",
#         "mk14_s": "2A",
#         "mk14_e": "LABS",
#         "sketch_extruder": "0.4mm",
#         "sketch_l_extruder": "0.4mm",
#         "sketch_sprint_extruder": "0.4mm",
#     }

#     # A map from the material-name in their native file-formats to some info, including the internal name we use.
#     MATERIAL_MAP = {
#         "abs": {"name": "ABS", "guid": "e0f1d581-cc6b-4e36-8f3c-3f5601ecba5f"},
#         "abs-cf10": {"name": "ABS-CF", "guid": "495a0ce5-9daf-4a16-b7b2-06856d82394d"},
#         "abs-wss1": {"name": "ABS-R", "guid": "88c8919c-6a09-471a-b7b6-e801263d862d"},
#         "asa": {"name": "ASA", "guid": "f79bc612-21eb-482e-ad6c-87d75bdde066"},
#         "nylon12-cf": {
#             "name": "Nylon 12 CF",
#             "guid": "3c6f2877-71cc-4760-84e6-4b89ab243e3b",
#         },
#         "nylon-cf": {
#             "name": "Nylon CF",
#             "guid": "17abb865-ca73-4ccd-aeda-38e294c9c60b",
#         },
#         "pet": {"name": "PETG", "guid": "2d004bbd-d1bb-47f8-beac-b066702d5273"},
#         "pla": {"name": "PLA", "guid": "abb9c58e-1f56-48d1-bd8f-055fde3a5b56"},
#         "pva": {"name": "PVA", "guid": "add51ef2-86eb-4c39-afd5-5586564f0715"},
#         "wss1": {"name": "RapidRinse", "guid": "a140ef8f-4f26-4e73-abe0-cfc29d6d1024"},
#         "sr30": {"name": "SR-30", "guid": "77873465-83a9-4283-bc44-4e542b8eb3eb"},
#         "im-pla": {"name": "Tough", "guid": "de031137-a8ca-4a72-bd1b-17bb964033ad"},
#         # /!\ When changing this list, make sure the changes are reported accordingly on Digital Factory
#     }

#     __inverse_printer_name: Optional[Dict[str, str]] = None
#     __inverse_extruder_type: Optional[Dict[str, str]] = None
#     __inverse_material_map: Optional[Dict[str, str]] = None
#     __product_to_id_map: Optional[Dict[str, List[str]]] = None

#     @classmethod
#     def getInversePrinterNameMap(cls) -> Dict[str, str]:
#         """Returns the inverse of the printer name map, that is, from the internal name to the name used in output."""
#         if cls.__inverse_printer_name is not None:
#             return cls.__inverse_printer_name
#         cls.__inverse_printer_name = {}
#         for key, value in cls.PRINTER_TYPE_NAME.items():
#             cls.__inverse_printer_name[value] = key
#         return cls.__inverse_printer_name

#     @classmethod
#     def getInverseExtruderTypeMap(cls) -> Dict[str, str]:
#         """Returns the inverse of the extruder type map, that is, from the internal name to the name used in output."""
#         if cls.__inverse_extruder_type is not None:
#             return cls.__inverse_extruder_type
#         cls.__inverse_extruder_type = {}
#         for key, value in cls.EXTRUDER_NAME_MAP.items():
#             cls.__inverse_extruder_type[value] = key
#         return cls.__inverse_extruder_type

#     @classmethod
#     def getInverseMaterialMap(cls) -> Dict[str, str]:
#         """Returns the inverse of the material map, that is, from the internal name to the name used in output.

#         Note that this drops the extra info saved in the non-inverse material map, use that if you need it.
#         """
#         if cls.__inverse_material_map is not None:
#             return cls.__inverse_material_map
#         cls.__inverse_material_map = {}
#         for key, value in cls.MATERIAL_MAP.items():
#             cls.__inverse_material_map[value["name"]] = key
#         return cls.__inverse_material_map

#     @classmethod
#     def getProductIdMap(cls) -> Dict[str, List[str]]:
#         """Gets a mapping from product names (for example, in the XML files) to their definition IDs.

#         This loads the mapping from a file.
#         """
#         if cls.__product_to_id_map is not None:
#             return cls.__product_to_id_map

#         product_to_id_file = Resources.getPath(Resources.Texts, "product_to_id.json")
#         with open(product_to_id_file, encoding="utf-8") as f:
#             contents = ""
#             for line in f:
#                 contents += (
#                     line
#                     if "#" not in line
#                     else "".join([line.replace("#", str(n)) for n in range(1, 12)])
#                 )
#             cls.__product_to_id_map = json.loads(contents)
#         cls.__product_to_id_map = {
#             key: [value] for key, value in cls.__product_to_id_map.items()
#         }
#         # This also loads "Ultimaker S5" -> "ultimaker_s5" even though that is not strictly necessary with the default to change spaces into underscores.
#         # However it is not always loaded with that default; this mapping is also used in serialize() without that default.
#         return cls.__product_to_id_map


def _parseCompatibleValue(value: str):
    """Parse the value of the "material compatible" property."""

    return value in {"yes", "unknown"}


def _tag_without_namespace(element):
    return element.tag[element.tag.rfind("}") + 1 :]


def _profile_name(material_name, color_name):
    if material_name is None:
        return "Unknown Material"
    if color_name != "Generic":
        return "%s %s" % (color_name, material_name)
    else:
        return material_name


def getPossibleDefinitionIDsFromName(name):
    name_parts = name.lower().split(" ")
    merged_name_parts = []
    for part in name_parts:
        if len(part) == 0:
            continue
        if len(merged_name_parts) == 0:
            merged_name_parts.append(part)
            continue
        if part.isdigit():
            # for names with digit(s) such as Ultimaker 3 Extended, we generate an ID like
            # "ultimaker3_extended", ignoring the space between "Ultimaker" and "3".
            merged_name_parts[-1] = merged_name_parts[-1] + part
        else:
            merged_name_parts.append(part)

    id_list = {
        name.lower().replace(" ", ""),  # simply removing all spaces
        name.lower().replace(" ", "_"),  # simply replacing all spaces with underscores
        "_".join(merged_name_parts),
        name.replace(" ", ""),
        name.replace(" ", "_"),
    }
    id_list = list(id_list)
    return id_list


def deserialize():
    data = root

    meta_data = {}
    meta_data["reserialize_settings"] = {}

    common_setting_values = {}

    # No profiles use this...
    # inherits = data.find("./um:inherits", self.__namespaces)
    # if inherits is not None:
    #     inherited = self._resolveInheritance(inherits.text)
    #     data = self._mergeXML(inherited, data)

    meta_data["name"] = "Unknown Material"  # In case the name tag is missing.
    for entry in data.iterfind("./um:metadata/*", __namespaces):
        tag_name = _tag_without_namespace(entry)

        if tag_name == "name":
            brand = entry.find("./um:brand", __namespaces)
            material = entry.find("./um:material", __namespaces)
            color = entry.find("./um:color", __namespaces)
            label = entry.find("./um:label", __namespaces)

            if label is not None and label.text is not None:
                meta_data["name"] = label.text
            else:
                meta_data["name"] = _profile_name(material.text, color.text)

            meta_data["brand"] = (
                brand.text if brand.text is not None else "Unknown Brand"
            )
            meta_data["material"] = (
                material.text if material.text is not None else "Unknown Type"
            )
            meta_data["color_name"] = (
                color.text if color.text is not None else "Unknown Color"
            )
            continue

        # setting_version is derived from the "version" tag in the schema earlier, so don't set it here
        if tag_name == "setting_version":
            continue

        meta_data[tag_name] = entry.text

        for tag_name, value in meta_data.items():
            if tag_name in __material_metadata_setting_map:
                common_setting_values[__material_metadata_setting_map[tag_name]] = value

    if "description" not in meta_data:
        meta_data["description"] = ""

    if "adhesion_info" not in meta_data:
        meta_data["adhesion_info"] = ""

    # validation_message = XmlMaterialValidator.validateMaterialMetaData(meta_data)
    # if validation_message is not None:
    #     ConfigurationErrorMessage.getInstance().addFaultyContainers(self.getId())
    #     Logger.log(
    #         "e",
    #         "Not a valid material profile: {message}".format(
    #             message=validation_message
    #         ),
    #     )
    #     i

    property_values = {}
    properties = data.iterfind("./um:properties/*", __namespaces)
    for entry in properties:
        tag_name = _tag_without_namespace(entry)
        property_values[tag_name] = entry.text

        if tag_name in __material_properties_setting_map:
            common_setting_values[__material_properties_setting_map[tag_name]] = (
                entry.text
            )

    meta_data["approximate_diameter"] = str(
        round(float(property_values.get("diameter", 2.85)))
    )  # In mm
    meta_data["properties"] = property_values
    meta_data["definition"] = "fdmprinter"

    common_compatibility = True
    settings = data.iterfind("./um:settings/um:setting", __namespaces)
    for entry in settings:
        key = entry.get("key")
        if key in __material_settings_setting_map:
            if (
                key == "processing temperature graph"
            ):  # This setting has no setting text but subtags.
                graph_nodes = entry.iterfind("./um:point", __namespaces)
                graph_points = []
                for graph_node in graph_nodes:
                    flow = float(graph_node.get("flow"))
                    temperature = float(graph_node.get("temperature"))
                    graph_points.append([flow, temperature])
                common_setting_values[__material_settings_setting_map[key]] = str(
                    graph_points
                )
            else:
                common_setting_values[__material_settings_setting_map[key]] = entry.text
        elif key in __unmapped_settings:
            if key == "hardware compatible":
                common_compatibility = _parseCompatibleValue(entry.text)
        elif key in __keep_serialized_settings:
            meta_data["reserialize_settings"][key] = entry.text

    # Add namespaced Cura-specific settings
    # settings = data.iterfind("./um:settings/cura:setting", __namespaces)
    # for entry in settings:
    #     value = entry.text
    #     if value.lower() == "yes":
    #         value = True
    #     elif value.lower() == "no":
    #         value = False
    #     key = entry.get("key")
    #     common_setting_values[key] = value

    # # self._cached_values = common_setting_values  # from InstanceContainer ancestor

    meta_data["compatible"] = common_compatibility
    # # self.setMetaData(meta_data)
    # # self._dirty = False

    # # # Map machine human-readable names to IDs
    # product_id_map = FormatMaps.getProductIdMap()

    # machines = data.iterfind("./um:settings/um:machine", __namespaces)
    # for machine in machines:
    #     machine_compatibility = common_compatibility
    #     machine_setting_values = {}
    #     settings = machine.iterfind("./um:setting", __namespaces)
    #     machine_reserialize_settings = {}
    #     for entry in settings:
    #         key = entry.get("key")
    #         if key in __material_settings_setting_map:
    #             if (
    #                 key == "processing temperature graph"
    #             ):  # This setting has no setting text but subtags.
    #                 graph_nodes = entry.iterfind("./um:point", __namespaces)
    #                 graph_points = []
    #                 for graph_node in graph_nodes:
    #                     flow = float(graph_node.get("flow"))
    #                     temperature = float(graph_node.get("temperature"))
    #                     graph_points.append([flow, temperature])
    #                 machine_setting_values[
    #                     __material_settings_setting_map[key]
    #                 ] = str(graph_points)
    #             else:
    #                 machine_setting_values[
    #                     __material_settings_setting_map[key]
    #                 ] = entry.text
    #         elif key in __unmapped_settings:
    #             if key == "hardware compatible":
    #                 machine_compatibility = _parseCompatibleValue(entry.text)
    #         elif key in __keep_serialized_settings:
    #             machine_reserialize_settings[key] = entry.text
    #         else:
    #             print("Unsupported material setting %s", key)
    #             # Logger.log("d", "Unsupported material setting %s", key)

    #     # Add namespaced Cura-specific settings
    #     settings = machine.iterfind("./cura:setting", __namespaces)
    #     for entry in settings:
    #         value = entry.text
    #         if value.lower() == "yes":
    #             value = True
    #         elif value.lower() == "no":
    #             value = False
    #         key = entry.get("key")
    #         machine_setting_values[key] = value

    #     cached_machine_setting_properties = common_setting_values.copy()
    #     cached_machine_setting_properties.update(machine_setting_values)

    #     identifiers = machine.iterfind("./um:machine_identifier", __namespaces)
    #     for identifier in identifiers:
    #         machine_id_list = product_id_map.get(identifier.get("product"), [])
    #         if not machine_id_list:
    #             machine_id_list = getPossibleDefinitionIDsFromName(
    #                 identifier.get("product")
    #             )
    #         for machine_id in machine_id_list:
    #             # definitions = (
    #             #     ContainerRegistry.getInstance().findDefinitionContainersMetadata(
    #             #         id=machine_id
    #             #     )
    #             # )
    #             # if not definitions:
    #             #     continue

    #             # definition = definitions[0]

    #             # machine_manufacturer = identifier.get(
    #             #     "manufacturer", definition.get("manufacturer", "Unknown")
    #             # )  # If the XML material doesn't specify a manufacturer, use the one in the actual printer definition.

    #             # Always create the instance of the material even if it is not compatible, otherwise it will never
    #             # show as incompatible if the material profile doesn't define hotends in the machine - CURA-5444
    #             new_material_id = self.getId() + "_" + machine_id

    #             # The child or derived material container may already exist. This can happen when a material in a
    #             # project file and the a material in Cura have the same ID.
    #             # In the case if a derived material already exists, override that material container because if
    #             # the data in the parent material has been changed, the derived ones should be updated too.
    #             # if ContainerRegistry.getInstance().isLoaded(new_material_id):
    #             #     new_material = ContainerRegistry.getInstance().findContainers(
    #             #         id=new_material_id
    #             #     )[0]
    #             #     is_new_material = False
    #             # else:
    #             #     new_material = XmlMaterialProfile(new_material_id)
    #             #     is_new_material = True

    #             new_material.setMetaData(copy.deepcopy(self.getMetaData()))
    #             new_material.getMetaData()["id"] = new_material_id
    #             new_material.getMetaData()["name"] = self.getName()
    #             new_material.setDefinition(machine_id)
    #             # Don't use setMetadata, as that overrides it for all materials with same base file
    #             new_material.getMetaData()["compatible"] = machine_compatibility
    #             # new_material.getMetaData()[
    #             #     "machine_manufacturer"
    #             # ] = machine_manufacturer
    #             new_material.getMetaData()["definition"] = machine_id
    #             new_material.getMetaData()[
    #                 "reserialize_settings"
    #             ] = machine_reserialize_settings

    #             new_material.setCachedValues(cached_machine_setting_properties)

    #             new_material._dirty = False

    #             if is_new_material:
    #                 containers_to_add.append(new_material)

    #             hotends = machine.iterfind("./um:hotend", self.__namespaces)
    #             for hotend in hotends:
    #                 # The "id" field for hotends in material profiles is actually name
    #                 hotend_name = hotend.get("id")
    #                 if hotend_name is None:
    #                     continue

    #                 (
    #                     hotend_mapped_settings,
    #                     hotend_unmapped_settings,
    #                     hotend_reserialize_settings,
    #                 ) = self._getSettingsDictForNode(hotend)
    #                 hotend_compatibility = hotend_unmapped_settings.get(
    #                     "hardware compatible", machine_compatibility
    #                 )

    #                 # Generate container ID for the hotend-specific material container
    #                 new_hotend_specific_material_id = (
    #                     self.getId()
    #                     + "_"
    #                     + machine_id
    #                     + "_"
    #                     + hotend_name.replace(" ", "_")
    #                 )

    #                 # Same as machine compatibility, keep the derived material containers consistent with the parent material
    #                 if ContainerRegistry.getInstance().isLoaded(
    #                     new_hotend_specific_material_id
    #                 ):
    #                     new_hotend_material = (
    #                         ContainerRegistry.getInstance().findContainers(
    #                             id=new_hotend_specific_material_id
    #                         )[0]
    #                     )
    #                     is_new_material = False
    #                 else:
    #                     new_hotend_material = XmlMaterialProfile(
    #                         new_hotend_specific_material_id
    #                     )
    #                     is_new_material = True

    #                 new_hotend_material.setMetaData(copy.deepcopy(self.getMetaData()))
    #                 new_hotend_material.getMetaData()[
    #                     "id"
    #                 ] = new_hotend_specific_material_id
    #                 new_hotend_material.getMetaData()["name"] = self.getName()
    #                 new_hotend_material.getMetaData()["variant_name"] = hotend_name
    #                 new_hotend_material.setDefinition(machine_id)
    #                 # Don't use setMetadata, as that overrides it for all materials with same base file
    #                 new_hotend_material.getMetaData()[
    #                     "compatible"
    #                 ] = hotend_compatibility
    #                 # new_hotend_material.getMetaData()[
    #                 #     "machine_manufacturer"
    #                 # ] = machine_manufacturer
    #                 new_hotend_material.getMetaData()["definition"] = machine_id
    #                 new_hotend_material.getMetaData()[
    #                     "reserialize_settings"
    #                 ] = hotend_reserialize_settings

    #                 cached_hotend_setting_properties = (
    #                     cached_machine_setting_properties.copy()
    #                 )
    #                 cached_hotend_setting_properties.update(hotend_mapped_settings)

    #                 new_hotend_material.setCachedValues(
    #                     cached_hotend_setting_properties
    #                 )

    #                 new_hotend_material._dirty = False

    #                 if is_new_material:
    #                     if ContainerRegistry.getInstance().isReadOnly(self.getId()):
    #                         ContainerRegistry.getInstance().setExplicitReadOnly(
    #                             new_hotend_material.getId()
    #                         )
    #                     containers_to_add.append(new_hotend_material)

    #             # there is only one ID for a machine. Once we have reached here, it means we have already found
    #             # a workable ID for that machine, so there is no need to continue
    #             break

    # for container_to_add in containers_to_add:
    #     ContainerRegistry.getInstance().addContainer(container_to_add)
    print("Metadata:", json.dumps(meta_data, indent=4))
    print("Settings", json.dumps(common_setting_values, indent=4))


deserialize()
