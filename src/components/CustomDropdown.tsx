import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';

import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { fontSize, hp, wp } from '../helpers/responsive';

type DropdownItem = {
  label: string;
  value: string;
};

type CustomDropdownProps = {
  value: string;
  options: DropdownItem[];
  onChange: (value: string) => void;
  iconSource: ImageSourcePropType;
  buttonWidth?: number | string;
  menuAlign?: 'left' | 'right';
};

const CustomDropdown = ({
  value,
  options,
  onChange,
  iconSource,
  buttonWidth = 'auto',
  menuAlign = 'right',
}: CustomDropdownProps) => {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find(option => option.value === value)?.label ?? value,
    [options, value],
  );

  const selectItem = (item: DropdownItem) => {
    onChange(item.value);
    setOpen(false);
  };

  return (
    <View style={[styles.container, { width: buttonWidth }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.trigger}
        onPress={() => setOpen(prev => !prev)}
      >
        <Text style={styles.label}>{selectedLabel}</Text>
        <Image source={iconSource} style={styles.icon} />
      </TouchableOpacity>

      {open ? (
        <View
          style={[
            styles.menu,
            menuAlign === 'left' ? styles.menuLeft : styles.menuRight,
          ]}
        >
          {options.map(item => {
            const isActive = item.value === value;
            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.8}
                style={styles.menuItem}
                onPress={() => selectItem(item)}
              >
                <Text
                  style={[styles.menuLabel, isActive && styles.menuLabelActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 20,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(999),
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    backgroundColor: colors.white,
    paddingHorizontal: wp(14),
    paddingVertical: hp(8),
  },
  label: {
    color: colors.D2D2D,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
    marginRight: wp(6),
  },
  icon: {
    width: wp(10),
    height: wp(10),
    resizeMode: 'contain',
  },
  menu: {
    position: 'absolute',
    top: hp(35),
    minWidth: wp(132),
    borderRadius: wp(14),
    borderWidth: 1,
    borderColor: colors.EBEBEB,
    backgroundColor: colors.white,
    paddingVertical: hp(6),
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  menuLeft: {
    left: 0,
  },
  menuRight: {
    right: 0,
  },
  menuItem: {
    paddingHorizontal: wp(14),
    paddingVertical: hp(10),
  },
  menuLabel: {
    color: colors.darkGray,
    fontSize: fontSize(12),
    fontFamily: fonts.Lato400,
  },
  menuLabelActive: {
    color: colors.primary,
    fontFamily: fonts.Lato700,
  },
});
