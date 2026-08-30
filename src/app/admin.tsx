import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/typography/AppText';
import { Button } from '@/components/buttons/Button';
import { CHAPTERS } from '@/data/chapters';
import {
  saveChapterToFirestore,
  saveChapterLocally,
  getLocalChapterOverrides,
  syncAllChaptersToFirestore,
} from '@/services/firestoreService';
import type { Chapter, ChapterVerse } from '@/types';
import { toKannadaNumerals, haptics } from '@/utils';

const ADMIN_PASSCODE = 'Shivu@2208';

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Chapter & Edit States
  const [allChapters, setAllChapters] = useState<Chapter[]>(CHAPTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParichheda, setSelectedParichheda] = useState<number | 'all'>('all');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Editing State
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSyncAll = async () => {
    Alert.alert(
      'ಕ್ಲೌಡ್ ಸಿಂಕ್ (Sync All to Cloud)',
      'ಕೋಡ್‌ನಲ್ಲಿರುವ ಎಲ್ಲಾ ೨೧ ಪರಿಚ್ಛೇದಗಳ ಹೊಸ ಡೇಟಾವನ್ನು ಫೈರ್‌ಬೇಸ್ ಕ್ಲೌಡ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡುವುದೇ?',
      [
        { text: 'ರದ್ದು (Cancel)', style: 'cancel' },
        {
          text: 'ಸಿಂಕ್ ಮಾಡಿ (Sync)',
          onPress: async () => {
            haptics.medium();
            setIsSyncingAll(true);
            const res = await syncAllChaptersToFirestore((current, total) => {
              setSyncProgress({ current, total });
            });
            setIsSyncingAll(false);
            if (res.success) {
              haptics.success();
              Alert.alert('ಯಶಸ್ವಿ!', `ಎಲ್ಲಾ ${toKannadaNumerals(res.count)} ಅಧ್ಯಾಯಗಳು ಕ್ಲೌಡ್‌ಗೆ ಸಿಂಕ್ ಆಗಿವೆ.`);
            } else {
              haptics.error();
              Alert.alert('ದೋಷ', res.error || 'ಕ್ಲೌಡ್ ಸಿಂಕ್ ವಿಫಲವಾಗಿದೆ.');
            }
          },
        },
      ]
    );
  };

  // Load any existing local overrides on mount
  useEffect(() => {
    getLocalChapterOverrides().then((overrides) => {
      if (Object.keys(overrides).length > 0) {
        setAllChapters((prev) =>
          prev.map((ch) => overrides[ch.id] || ch)
        );
      }
    });
  }, []);

  const handleLogin = () => {
    if (inputCode === ADMIN_PASSCODE) {
      haptics.success();
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      haptics.error();
      setAuthError('ಅಮಾನ್ಯ ಆಡಳಿತ ಕೋಡ್ (Invalid Admin Code)');
    }
  };

  const handleSelectChapter = (ch: Chapter) => {
    haptics.light();
    // Clone chapter for editing
    const clone: Chapter = JSON.parse(JSON.stringify(ch));
    setSelectedChapter(clone);
    setEditingChapter(clone);
    setStatusMessage(null);
  };

  const handleVerseChange = (
    index: number,
    field: keyof ChapterVerse,
    value: string | number
  ) => {
    if (!editingChapter) return;
    const updatedContent = [...editingChapter.content];
    updatedContent[index] = {
      ...updatedContent[index],
      [field]: value,
    };
    setEditingChapter({
      ...editingChapter,
      content: updatedContent,
      versesCount: updatedContent.length,
    });
  };

  const handleAddVerse = () => {
    if (!editingChapter) return;
    haptics.light();
    const nextVerseNum = editingChapter.content.length + 1;
    const newVerse: ChapterVerse = {
      id: `${editingChapter.id}_v${nextVerseNum}`,
      verseNumber: nextVerseNum,
      sanskrit: '',
      translation: '',
      commentary: '',
    };
    setEditingChapter({
      ...editingChapter,
      content: [...editingChapter.content, newVerse],
      versesCount: editingChapter.content.length + 1,
    });
  };

  const handleDeleteVerse = (index: number) => {
    if (!editingChapter) return;
    Alert.alert(
      'ಶ್ಲೋಕ ಅಳಿಸಿ (Delete Verse)',
      `ಶ್ಲೋಕ ${toKannadaNumerals(index + 1)} ಅನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವೇ?`,
      [
        { text: 'ರದ್ದು', style: 'cancel' },
        {
          text: 'ಅಳಿಸಿ',
          style: 'destructive',
          onPress: () => {
            haptics.warning();
            const updated = editingChapter.content.filter((_, i) => i !== index);
            // Re-number remaining verses
            const renumbered = updated.map((v, i) => ({
              ...v,
              verseNumber: i + 1,
            }));
            setEditingChapter({
              ...editingChapter,
              content: renumbered,
              versesCount: renumbered.length,
            });
          },
        },
      ]
    );
  };

  const handleSaveCloud = async () => {
    if (!editingChapter) return;
    haptics.medium();
    setIsSaving(true);
    setStatusMessage(null);

    const result = await saveChapterToFirestore(editingChapter);
    setIsSaving(false);

    if (result.success) {
      haptics.success();
      setStatusMessage({
        type: 'success',
        text: 'ಅಧ್ಯಾಯವನ್ನು ಫೈರ್‌ಬೇಸ್ ಕ್ಲೌಡ್‌ನಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ! (Saved to Firestore)',
      });
      // Update global list state
      setAllChapters((prev) =>
        prev.map((c) => (c.id === editingChapter.id ? editingChapter : c))
      );
      setSelectedChapter(editingChapter);
    } else {
      haptics.error();
      setStatusMessage({
        type: 'error',
        text: result.error || 'ಫೈರ್‌ಬೇಸ್ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಸ್ಥಳೀಯವಾಗಿ ಮಾತ್ರ ಉಳಿಸಲಾಗಿದೆ.',
      });
    }
  };

  const handleSaveLocal = async () => {
    if (!editingChapter) return;
    haptics.light();
    await saveChapterLocally(editingChapter);
    setAllChapters((prev) =>
      prev.map((c) => (c.id === editingChapter.id ? editingChapter : c))
    );
    setSelectedChapter(editingChapter);
    setStatusMessage({
      type: 'success',
      text: 'ಅಧ್ಯಾಯವನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಮಾತ್ರ ಉಳಿಸಲಾಗಿದೆ (Saved Locally).',
    });
  };

  // Filter chapters
  const filteredChapters = useMemo(() => {
    return allChapters.filter((c) => {
      const matchParichheda =
        selectedParichheda === 'all' ||
        c.parichheda?.number === selectedParichheda;
      const matchQuery =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.number.toString() === searchQuery.trim() ||
        c.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchParichheda && matchQuery;
    });
  }, [allChapters, selectedParichheda, searchQuery]);

  // ═══════════════════════════════════════════════════════════════════
  // 1. LOGIN SCREEN (If not authenticated)
  // ═══════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#F9F6F0]"
      >
        <View className="flex-1 justify-center px-6" style={{ paddingTop: insets.top, paddingBottom: bottomInset }}>
          <View className="items-center mb-8">
            <LinearGradient
              colors={['#8A3324', '#5E2116']}
              className="w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-lg"
            >
              <Ionicons name="shield-checkmark" size={38} color="#FFFFFF" />
            </LinearGradient>
            <AppText variant="heading2" weight="bold" className="text-[#3D2314] mb-1">
              ಆಡಳಿತ ಲಾಗಿನ್
            </AppText>
            <AppText variant="caption" color="muted" align="center">
              ಸಿದ್ಧಾಂತ ಶಿಖಾಮಣಿ ವಿಷಯ ಸಂಪಾದಕ ಪೋರ್ಟಲ್ (Admin Portal)
            </AppText>
          </View>

          <View className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 mb-6">
            <AppText variant="caption" weight="bold" className="text-[#3D2314] mb-2">
              ಆಡಳಿತ ಭದ್ರತಾ ಕೋಡ್ (Admin Passcode)
            </AppText>
            <View className="flex-row items-center bg-[#FDFBF7] border border-amber-200 rounded-2xl px-4 py-3 mb-3">
              <Ionicons name="key-outline" size={20} color="#8A3324" className="mr-3" />
              <TextInput
                className="flex-1 text-base text-[#3D2314] ml-2"
                placeholder="ಕೋಡ್ ನಮೂದಿಸಿ..."
                placeholderTextColor="#A88C74"
                secureTextEntry
                value={inputCode}
                onChangeText={(t) => {
                  setInputCode(t);
                  setAuthError('');
                }}
                onSubmitEditing={handleLogin}
              />
            </View>

            {authError ? (
              <AppText variant="caption" className="text-red-600 mb-3">
                {authError}
              </AppText>
            ) : null}

            <Button
              variant="gradient"
              fullWidth
              icon="log-in-outline"
              onPress={handleLogin}
            >
              ಪ್ರವೇಶಿಸಿ (Login)
            </Button>
          </View>

          <Pressable
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            onPress={() => {
              haptics.light();
              router.back();
            }}
            className="flex-row items-center justify-center py-2.5 mt-2"
          >
            <Ionicons name="arrow-back" size={20} color="#8A3324" />
            <AppText variant="body" weight="semibold" className="text-[#8A3324] ml-1.5">
              ಹಿಂದಕ್ಕೆ ಹೋಗಿ (Back)
            </AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. CHAPTER EDITING VIEW
  // ═══════════════════════════════════════════════════════════════════
  if (editingChapter) {
    return (
      <View className="flex-1 bg-[#F9F6F0]" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="bg-white border-b border-amber-100 px-3.5 py-2.5 flex-row items-center justify-between">
          <Pressable
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => {
              haptics.light();
              setEditingChapter(null);
              setSelectedChapter(null);
            }}
            className="flex-row items-center py-1.5 pr-2"
          >
            <Ionicons name="arrow-back" size={22} color="#8A3324" />
            <AppText variant="bodySmall" weight="bold" className="text-[#8A3324] ml-1">
              ಅಧ್ಯಾಯಗಳು
            </AppText>
          </Pressable>

          <View className="flex-row items-center gap-1.5">
            <Pressable
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              onPress={() => router.push(`/reading/${editingChapter.id}`)}
              className="bg-amber-100 px-2.5 py-1.5 rounded-xl flex-row items-center"
            >
              <Ionicons name="eye-outline" size={15} color="#8A3324" />
              <AppText weight="bold" style={{ color: '#8A3324', fontSize: 12, marginLeft: 4 }}>
                ನೋಡಿ
              </AppText>
            </Pressable>

            <Pressable
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              onPress={handleSaveCloud}
              disabled={isSaving}
              className="bg-[#8A3324] px-3 py-1.5 rounded-xl flex-row items-center"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={15} color="#FFFFFF" />
                  <AppText weight="bold" style={{ color: '#FFFFFF', fontSize: 12, marginLeft: 4 }}>
                    ಕ್ಲೌಡ್ ಸೇವ್
                  </AppText>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* Status Notification Banner */}
        {statusMessage && (
          <View
            className={`px-4 py-2.5 flex-row items-center ${
              statusMessage.type === 'success' ? 'bg-emerald-50 border-b border-emerald-200' : 'bg-red-50 border-b border-red-200'
            }`}
          >
            <Ionicons
              name={statusMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={statusMessage.type === 'success' ? '#059669' : '#DC2626'}
            />
            <AppText
              variant="caption"
              weight="medium"
              className={`ml-2 flex-1 ${statusMessage.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}
            >
              {statusMessage.text}
            </AppText>
          </View>
        )}

        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottomInset + 80 }}
        >
          {/* Chapter Metadata Card */}
          <View className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm mb-4">
            <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-amber-100">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-8 h-8 rounded-xl bg-amber-100 items-center justify-center mr-2 flex-shrink-0">
                  <Ionicons name="book" size={16} color="#8A3324" />
                </View>
                <View className="flex-1">
                  <AppText variant="caption" color="muted" numberOfLines={1}>
                    {editingChapter.parichheda?.title || `ಪರಿಚ್ಛೇದ ${editingChapter.parichheda?.number || 1}`}
                  </AppText>
                  <AppText variant="body" weight="bold" className="text-[#3D2314]" numberOfLines={1}>
                    ಅಧ್ಯಾಯ {toKannadaNumerals(editingChapter.number)}
                  </AppText>
                </View>
              </View>
              <View className="bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex-shrink-0">
                <AppText weight="bold" style={{ color: '#8A3324', fontSize: 12 }}>
                  {toKannadaNumerals(editingChapter.content.length)} ಶ್ಲೋಕ
                </AppText>
              </View>
            </View>

            <AppText variant="caption" weight="semibold" className="text-gray-600 mb-1">
              ಅಧ್ಯಾಯದ ಶೀರ್ಷಿಕೆ (Title):
            </AppText>
            <TextInput
              className="bg-[#FDFBF7] border border-amber-200 rounded-xl px-3.5 py-2.5 text-base text-[#3D2314] mb-3"
              value={editingChapter.title}
              onChangeText={(t) => setEditingChapter({ ...editingChapter, title: t })}
              placeholder="ಅಧ್ಯಾಯ ಶೀರ್ಷಿಕೆ..."
            />

            <AppText variant="caption" weight="semibold" className="text-gray-600 mb-1">
              ಉಪಶೀರ್ಷಿಕೆ (Subtitle):
            </AppText>
            <TextInput
              className="bg-[#FDFBF7] border border-amber-200 rounded-xl px-3.5 py-2.5 text-base text-[#3D2314] mb-3"
              value={editingChapter.subtitle}
              onChangeText={(t) => setEditingChapter({ ...editingChapter, subtitle: t })}
              placeholder="ಉಪಶೀರ್ಷಿಕೆ..."
            />

            <AppText variant="caption" weight="semibold" className="text-gray-600 mb-1">
              ವಿವರಣೆ / ಪೀಠಿಕೆ (Description):
            </AppText>
            <TextInput
              className="bg-[#FDFBF7] border border-amber-200 rounded-xl px-3.5 py-2.5 text-sm text-[#3D2314]"
              multiline
              numberOfLines={3}
              value={editingChapter.description}
              onChangeText={(t) => setEditingChapter({ ...editingChapter, description: t })}
              placeholder="ಅಧ್ಯಾಯದ ವಿವರಣೆ..."
            />
          </View>

          {/* Verses Header */}
          <View className="flex-row items-center justify-between mb-3 px-1">
            <AppText variant="heading3" weight="bold" className="text-[#3D2314]">
              ಶ್ಲೋಕಗಳು ({toKannadaNumerals(editingChapter.content.length)})
            </AppText>
            <Pressable
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={handleAddVerse}
              className="bg-emerald-600 px-3 py-1.5 rounded-xl flex-row items-center"
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <AppText weight="bold" style={{ color: '#FFFFFF', fontSize: 12, marginLeft: 4 }}>
                ಶ್ಲೋಕ ಸೇರಿಸಿ
              </AppText>
            </Pressable>
          </View>

          {/* Verses List */}
          {editingChapter.content.map((verse, index) => (
            <View
              key={verse.id || index}
              className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm mb-4"
            >
              <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-amber-100">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-7 h-7 rounded-full bg-[#8A3324] items-center justify-center mr-2 flex-shrink-0">
                    <AppText weight="bold" style={{ color: '#FFFFFF', fontSize: 12 }}>
                      {toKannadaNumerals(verse.verseNumber || index + 1)}
                    </AppText>
                  </View>
                  <AppText weight="bold" style={{ color: '#3D2314', fontSize: 15 }}>
                    ಶ್ಲೋಕ {toKannadaNumerals(verse.verseNumber || index + 1)}
                  </AppText>
                </View>

                <Pressable
                  onPress={() => handleDeleteVerse(index)}
                  className="p-1.5 rounded-lg bg-red-50"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                </Pressable>
              </View>

              {/* Sanskrit Text */}
              <AppText variant="caption" weight="bold" className="text-[#8A3324] mb-1">
                ಸಂಸ್ಕೃತ ಶ್ಲೋಕ (Sanskrit Verse):
              </AppText>
              <TextInput
                className="bg-[#FFFDF9] border border-amber-200 rounded-xl p-3 text-base text-[#3D2314] font-serif leading-6 mb-3"
                multiline
                value={verse.sanskrit}
                onChangeText={(t) => handleVerseChange(index, 'sanskrit', t)}
                placeholder="ಸಂಸ್ಕೃತ ಶ್ಲೋಕವನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ..."
                placeholderTextColor="#A88C74"
              />

              {/* Kannada Translation */}
              <AppText variant="caption" weight="bold" className="text-[#3D2314] mb-1">
                ಕನ್ನಡ ಭಾವಾರ್ಥ (Kannada Translation):
              </AppText>
              <TextInput
                className="bg-[#FFFDF9] border border-amber-200 rounded-xl p-3 text-sm text-[#3D2314] leading-5 mb-3"
                multiline
                value={verse.translation}
                onChangeText={(t) => handleVerseChange(index, 'translation', t)}
                placeholder="ಕನ್ನಡ ಭಾವಾರ್ಥವನ್ನು ಇಲ್ಲಿ ನಮೂದಿಸಿ..."
                placeholderTextColor="#A88C74"
              />

              {/* Commentary */}
              <AppText variant="caption" weight="medium" className="text-gray-600 mb-1">
                ವಿಶೇಷ ವಿವರಣೆ / ಟಿಪ್ಪಣಿ (Commentary - ಐಚ್ಛಿಕ):
              </AppText>
              <TextInput
                className="bg-[#FFFDF9] border border-amber-200 rounded-xl p-3 text-sm text-[#3D2314] leading-5"
                multiline
                value={verse.commentary || ''}
                onChangeText={(t) => handleVerseChange(index, 'commentary', t)}
                placeholder="ಹೆಚ್ಚುವರಿ ವಿವರಣೆ..."
                placeholderTextColor="#A88C74"
              />
            </View>
          ))}

          {/* Bottom Action Buttons */}
          <View className="flex-row gap-3 mt-3 mb-8">
            <Button
              variant="outline"
              className="flex-1"
              icon="save-outline"
              onPress={handleSaveLocal}
            >
              ಸ್ಥಳೀಯ ಉಳಿಸಿ
            </Button>
            <Button
              variant="gradient"
              className="flex-1"
              icon="cloud-upload-outline"
              disabled={isSaving}
              onPress={handleSaveCloud}
            >
              ಕ್ಲೌಡ್ ಸಿಂಕ್
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. CHAPTER SELECTION DASHBOARD
  // ═══════════════════════════════════════════════════════════════════
  return (
    <View className="flex-1 bg-[#F9F6F0]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-amber-100 px-4 py-3.5 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-2">
          <Pressable
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            onPress={() => {
              haptics.light();
              router.back();
            }}
            className="mr-3 p-1"
          >
            <Ionicons name="arrow-back" size={24} color="#8A3324" />
          </Pressable>
          <View className="flex-1">
            <AppText variant="heading3" weight="bold" className="text-[#3D2314]" numberOfLines={1}>
              ಆಡಳಿತ ಸಂಪಾದಕ
            </AppText>
            <AppText variant="caption" color="muted" numberOfLines={1}>
              ಒಟ್ಟು {toKannadaNumerals(allChapters.length)} ಅಧ್ಯಾಯಗಳು
            </AppText>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            onPress={handleSyncAll}
            disabled={isSyncingAll}
            className="bg-[#8A3324] px-3 py-1.5 rounded-xl flex-row items-center flex-shrink-0 shadow-sm"
          >
            {isSyncingAll ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={15} color="#FFFFFF" />
                <AppText weight="bold" style={{ color: '#FFFFFF', fontSize: 12, marginLeft: 4 }}>
                  ಸಿಂಕ್ ಆಲ್
                </AppText>
              </>
            )}
          </Pressable>

          <Pressable
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            onPress={() => {
              haptics.light();
              setIsAuthenticated(false);
            }}
            className="bg-amber-100 px-3 py-1.5 rounded-xl flex-row items-center flex-shrink-0"
          >
            <Ionicons name="log-out-outline" size={16} color="#8A3324" />
            <AppText weight="bold" style={{ color: '#8A3324', fontSize: 12, marginLeft: 4 }}>
              ನಿರ್ಗಮಿಸಿ
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Search & Filter Bar */}
      <View className="p-4 bg-white border-b border-amber-100">
        <View className="flex-row items-center bg-[#FDFBF7] border border-amber-200 rounded-2xl px-3.5 py-2.5 mb-3">
          <Ionicons name="search" size={18} color="#8A3324" className="mr-2" />
          <TextInput
            className="flex-1 text-sm text-[#3D2314] ml-2"
            placeholder="ಅಧ್ಯಾಯ ಸಂಖ್ಯೆ ಅಥವಾ ಹೆಸರು ಹುಡುಕಿ..."
            placeholderTextColor="#A88C74"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#A88C74" />
            </Pressable>
          ) : null}
        </View>

        {/* Parichheda Pill Scroller */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          <Pressable
            onPress={() => setSelectedParichheda('all')}
            className={`px-3 py-1.5 rounded-full mr-2 ${
              selectedParichheda === 'all' ? 'bg-[#8A3324]' : 'bg-amber-100'
            }`}
          >
            <AppText
              variant="caption"
              weight="bold"
              className={selectedParichheda === 'all' ? 'text-white' : 'text-[#8A3324]'}
            >
              ಎಲ್ಲಾ ಪರಿಚ್ಛೇದಗಳು
            </AppText>
          </Pressable>

          {Array.from({ length: 21 }, (_, i) => i + 1).map((pNum) => (
            <Pressable
              key={pNum}
              onPress={() => setSelectedParichheda(pNum)}
              className={`px-3 py-1.5 rounded-full mr-2 ${
                selectedParichheda === pNum ? 'bg-[#8A3324]' : 'bg-amber-100'
              }`}
            >
              <AppText
                variant="caption"
                weight="bold"
                className={selectedParichheda === pNum ? 'text-white' : 'text-[#8A3324]'}
              >
                ಪರಿಚ್ಛೇದ {toKannadaNumerals(pNum)}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Chapters List */}
      <ScrollView
        className="flex-1 px-4 py-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
      >
        {filteredChapters.map((ch) => (
          <Pressable
            key={ch.id}
            onPress={() => handleSelectChapter(ch)}
            className="bg-white rounded-2xl p-4 mb-3 border border-amber-100 shadow-sm flex-row items-center justify-between"
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#FFF8F2' : '#FFFFFF',
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <View className="flex-1 mr-3">
              <View className="flex-row items-center mb-1">
                <View className="bg-amber-100 px-2 py-0.5 rounded-md mr-2">
                  <AppText variant="caption" weight="bold" className="text-[#8A3324] text-[11px]">
                    ಅಧ್ಯಾಯ {toKannadaNumerals(ch.number)}
                  </AppText>
                </View>
                {ch.parichheda && (
                  <AppText variant="caption" color="muted" numberOfLines={1} className="flex-1 text-[11px]">
                    {ch.parichheda.title}
                  </AppText>
                )}
              </View>
              <AppText variant="body" weight="bold" className="text-[#3D2314] mb-0.5" numberOfLines={1}>
                {ch.title}
              </AppText>
              <AppText variant="caption" color="muted" numberOfLines={1}>
                {ch.subtitle || `${toKannadaNumerals(ch.content?.length || ch.versesCount)} ಶ್ಲೋಕಗಳು`}
              </AppText>
            </View>

            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center border border-amber-200">
                <Ionicons name="create-outline" size={18} color="#8A3324" />
              </View>
            </View>
          </Pressable>
        ))}

        {filteredChapters.length === 0 && (
          <View className="items-center py-12">
            <Ionicons name="search-outline" size={40} color="#A88C74" />
            <AppText variant="body" color="muted" align="center" className="mt-2">
              ಯಾವುದೇ ಅಧ್ಯಾಯ ಕಂಡುಬಂದಿಲ್ಲ
            </AppText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
